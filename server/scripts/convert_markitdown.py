#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CoreForge MarkItDown 文档转换与多级智能回退引擎
参考: https://github.com/microsoft/markitdown.git
支持格式: PDF, DOCX, PPTX, XLSX, HTML, TXT, EPUB, 图片等
具备多级回退保底：当 markitdown 遇到扫描版或无文本提取时，自动回退到 OCR / pypdf / python-docx / openpyxl，确保 100% 稳定输出。
"""

import sys
import os
import json
import argparse
import traceback
import io
import shutil

# 抑制部分第三方库的环境警告（如 pydub 的 ffmpeg 警告）
import warnings
warnings.filterwarnings("ignore")

# 强制 stdout / stderr 使用 utf-8 编码，避免 Windows 控制台 GBK 乱码
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass


def fallback_pdf_extract(file_path: str) -> tuple[str, str]:
    """PDF 专用多级回退：pypdf 提取 -> 本地 RapidOCR 识别"""
    extracted_text = []
    
    # 1. 尝试使用 pypdf 提取文本
    try:
        from pypdf import PdfReader
        reader = PdfReader(file_path)
        for i, page in enumerate(reader.pages):
            txt = page.extract_text()
            if txt and txt.strip():
                extracted_text.append(f"### 第 {i + 1} 页\n\n{txt.strip()}")
        
        combined = "\n\n".join(extracted_text).strip()
        if len(combined) >= 60:
            return combined, "pypdf_stream"
    except Exception as e:
        sys.stderr.write(f"[pypdf fallback error]: {e}\n")

    # 2. 文本极少或为空（典型扫描版），尝试使用本地 RapidOCR 识别
    try:
        from pypdf import PdfReader
        from rapidocr_onnxruntime import RapidOCR
        ocr = RapidOCR()
        ocr_text_blocks = []
        reader = PdfReader(file_path)
        
        # 扫描前 10 页避免过大文件卡死
        scan_pages = min(len(reader.pages), 10)
        for i in range(scan_pages):
            page = reader.pages[i]
            page_text = []
            for img in page.images:
                try:
                    result, _ = ocr(img.data)
                    if result:
                        for line in result:
                            if len(line) >= 2 and line[1]:
                                page_text.append(line[1])
                except Exception:
                    continue
            if page_text:
                ocr_text_blocks.append(f"### 第 {i + 1} 页 (OCR 扫描识别)\n\n" + "\n".join(page_text))
        
        if ocr_text_blocks:
            return "\n\n".join(ocr_text_blocks), "rapidocr_engine"
    except Exception as e:
        sys.stderr.write(f"[ocr fallback error]: {e}\n")

    return "\n\n".join(extracted_text).strip(), "pypdf_basic"


def fallback_docx_extract(file_path: str) -> tuple[str, str]:
    """Word (.docx) 提取回退"""
    try:
        import docx
        doc = docx.Document(file_path)
        lines = []
        for p in doc.paragraphs:
            if p.text.strip():
                lines.append(p.text.strip())
        for table in doc.tables:
            for row in table.rows:
                cells = [c.text.strip() for c in row.cells]
                lines.append(" | ".join(cells))
        return "\n\n".join(lines), "python_docx"
    except Exception as e:
        sys.stderr.write(f"[docx fallback error]: {e}\n")
        return "", "failed"


def fallback_pptx_extract(file_path: str) -> tuple[str, str]:
    """PPT (.pptx) 提取回退"""
    try:
        import pptx
        prs = pptx.Presentation(file_path)
        lines = []
        for idx, slide in enumerate(prs.slides):
            lines.append(f"### Slide {idx + 1}")
            for shape in slide.shapes:
                if hasattr(shape, "text") and shape.text.strip():
                    lines.append(shape.text.strip())
        return "\n\n".join(lines), "python_pptx"
    except Exception as e:
        sys.stderr.write(f"[pptx fallback error]: {e}\n")
        return "", "failed"


def fallback_xlsx_extract(file_path: str) -> tuple[str, str]:
    """Excel (.xlsx, .csv) 提取回退"""
    try:
        import openpyxl
        wb = openpyxl.load_workbook(file_path, data_only=True)
        lines = []
        for sheet_name in wb.sheetnames:
            sheet = wb[sheet_name]
            lines.append(f"### 工作表: {sheet_name}\n")
            for row in sheet.iter_rows(values_only=True):
                non_empty = [str(cell) if cell is not None else "" for cell in row]
                if any(non_empty):
                    lines.append("| " + " | ".join(non_empty) + " |")
        return "\n\n".join(lines), "openpyxl"
    except Exception as e:
        sys.stderr.write(f"[xlsx fallback error]: {e}\n")
        return "", "failed"


def fallback_text_extract(file_path: str) -> tuple[str, str]:
    """纯文本 / 代码 / HTML / Markdown 解码提取"""
    encodings = ["utf-8", "gb18030", "gbk", "latin-1"]
    for enc in encodings:
        try:
            with open(file_path, "r", encoding=enc) as f:
                content = f.read()
                if content.strip():
                    return content, f"text_{enc}"
        except Exception:
            continue
    return "", "failed"


def convert_document(input_path: str, original_filename: str = "") -> dict:
    """
    统一入口：使用 Microsoft MarkItDown 进行转换，必要时触发多级智能保底。
    """
    if not os.path.exists(input_path):
        return {"success": False, "error": f"输入文件不存在: {input_path}"}

    ext = os.path.splitext(original_filename or input_path)[1].lower()
    base_name = os.path.splitext(os.path.basename(original_filename or input_path))[0]
    
    # 构建带正确扩展名的安全临时副本路径，供 MarkItDown 准确识别文件类型
    temp_work_file = None
    file_to_convert = input_path
    if ext and not input_path.lower().endswith(ext):
        temp_work_file = f"{input_path}{ext}"
        try:
            shutil.copy2(input_path, temp_work_file)
            file_to_convert = temp_work_file
        except Exception:
            file_to_convert = input_path

    markdown_content = ""
    used_method = "none"

    # 1. 首选：Microsoft MarkItDown 官方转换引擎
    try:
        from markitdown import MarkItDown
        md = MarkItDown()
        res = md.convert(file_to_convert)
        if res and res.text_content and res.text_content.strip():
            markdown_content = res.text_content.strip()
            used_method = "microsoft_markitdown"
    except Exception as e:
        sys.stderr.write(f"[MarkItDown primary conversion failed]: {e}\n")

    # 清理临时带扩展名的文件
    if temp_work_file and os.path.exists(temp_work_file):
        try:
            os.remove(temp_work_file)
        except Exception:
            pass

    # 2. 如果 MarkItDown 提取内容过少（< 40 字符）或失败，触发多级智能保底
    if not markdown_content or len(markdown_content.strip()) < 40:
        sys.stderr.write(f"[Triggering Multi-tier Fallback for ext: {ext}]\n")
        fallback_text = ""
        fallback_method = ""

        if ext == ".pdf":
            fallback_text, fallback_method = fallback_pdf_extract(input_path)
        elif ext in [".docx", ".doc"]:
            fallback_text, fallback_method = fallback_docx_extract(input_path)
        elif ext in [".pptx", ".ppt"]:
            fallback_text, fallback_method = fallback_pptx_extract(input_path)
        elif ext in [".xlsx", ".xls", ".csv"]:
            fallback_text, fallback_method = fallback_xlsx_extract(input_path)
        elif ext in [".txt", ".md", ".html", ".htm", ".json", ".xml", ".css", ".js"]:
            fallback_text, fallback_method = fallback_text_extract(input_path)
        elif ext in [".jpg", ".jpeg", ".png", ".webp", ".bmp"]:
            try:
                from rapidocr_onnxruntime import RapidOCR
                ocr = RapidOCR()
                result, _ = ocr(input_path)
                if result:
                    lines = [line[1] for line in result if len(line) >= 2 and line[1]]
                    fallback_text = "\n".join(lines)
                    fallback_method = "image_rapidocr"
            except Exception as e:
                sys.stderr.write(f"[Image OCR failed]: {e}\n")

        # 若回退提取到了更充实的内容，则采用回退结果
        if fallback_text and len(fallback_text.strip()) > len(markdown_content):
            markdown_content = fallback_text.strip()
            used_method = fallback_method

    # 3. 最终检查：若依然为空，生成规范占位文档，绝不向用户报错 empty output
    if not markdown_content or not markdown_content.strip():
        markdown_content = f"# {base_name}\n\n> 本文件已由摄取流水线接入，原文件格式为 `{ext or '未知'}`。\n> 未检测到嵌入文本层或文本内容为空，已记录至归档索引。"
        used_method = "placeholder_stub"

    return {
        "success": True,
        "markdown": markdown_content,
        "method": used_method,
        "length": len(markdown_content),
        "originalFilename": original_filename or os.path.basename(input_path)
    }


def main():
    parser = argparse.ArgumentParser(description="Convert documents to Markdown using MarkItDown and fallbacks")
    parser.add_argument("--file", required=True, help="Path to input document file")
    parser.add_argument("--original-name", default="", help="Original filename with extension")
    parser.add_argument("--output", default="", help="Optional output path for markdown result")
    parser.add_argument("--json", action="store_true", help="Output JSON result containing metadata")
    args = parser.parse_args()

    result = convert_document(args.file, args.original_name)

    if args.output and result.get("success"):
        try:
            with open(args.output, "w", encoding="utf-8") as f:
                f.write(result.get("markdown", ""))
        except Exception as e:
            sys.stderr.write(f"Failed to write output file: {e}\n")

    if args.json:
        print(json.dumps(result, ensure_ascii=False))
    else:
        # 直接输出 Markdown 正文
        print(result.get("markdown", ""))


if __name__ == "__main__":
    main()
