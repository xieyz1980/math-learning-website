// PDF 解析工具 - 使用 pdf-parse
const pdfParse = require("pdf-parse");

/**
 * 从 PDF Buffer 中提取文本
 * @param {Buffer} buffer - PDF 文件的 Buffer
 * @returns {Promise<string>} 提取的文本内容
 */
async function extractTextFromPDF(buffer) {
  try {
    console.log("开始解析 PDF...");
    console.log("Buffer 大小:", buffer.length);

    // 使用 pdf-parse 解析 PDF
    const data = await pdfParse(buffer);

    console.log(`PDF 解析完成，共 ${data.numpages} 页`);
    console.log(`提取文本长度: ${data.text.length}`);

    return data.text;
  } catch (error) {
    console.error("PDF 解析错误:", error);
    console.error("错误堆栈:", error.stack);
    throw new Error(`PDF 解析失败: ${error.message || error}`);
  }
}

module.exports = {
  extractTextFromPDF,
};
