// PDF 解析工具 - 使用 pdfjs-dist v3.11.174
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");

/**
 * 从 PDF Buffer 中提取文本
 * @param {Buffer} buffer - PDF 文件的 Buffer
 * @returns {Promise<string>} 提取的文本内容
 */
async function extractTextFromPDF(buffer) {
  try {
    console.log("开始解析 PDF...");
    console.log("Buffer 大小:", buffer.length);

    // 加载 PDF 文档
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
      fontExtraProperties: false,
    });

    const pdf = await loadingTask.promise;
    console.log(`PDF 加载成功，共 ${pdf.numPages} 页`);

    let fullText = "";

    // 遍历所有页面
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      const pageText = textContent.items
        .map((item) => item.str)
        .join(" ");

      fullText += pageText + "\n";
      console.log(`已解析第 ${i} 页`);
    }

    console.log("PDF 解析完成");
    console.log(`提取文本长度: ${fullText.length}`);

    return fullText;
  } catch (error) {
    console.error("PDF 解析错误:", error);
    console.error("错误堆栈:", error.stack);
    throw new Error(`PDF 解析失败: ${error.message || error}`);
  }
}

module.exports = {
  extractTextFromPDF,
};
