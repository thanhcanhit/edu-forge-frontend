/**
 * Extract plain text from BlockNote JSON content
 * @param content The JSON string from BlockNote editor
 * @returns Plain text representation of the content
 */
export function extractPlainTextFromBlockNote(content: string): string {
  try {
    // Kiểm tra xem content có phải là chuỗi không
    if (!content || typeof content !== "string") {
      return "No content available";
    }

    // Kiểm tra xem content có phải JSON không
    // Thử tìm ký tự đầu tiên sau khi bỏ qua khoảng trắng
    const trimmed = content.trim();
    if (!trimmed || (trimmed[0] !== "[" && trimmed[0] !== "{")) {
      return typeof content === "string" ? content : "Invalid content format";
    }

    const parsedContent = JSON.parse(content);
    if (!Array.isArray(parsedContent)) return "No content available";

    // Extract text content from blocks
    return parsedContent
      .map((block: any) => {
        // Handle different block types
        if (
          block.type === "paragraph" ||
          block.type === "heading" ||
          block.type === "bulletListItem" ||
          block.type === "numberedListItem"
        ) {
          // Extract text from content array
          return block.content?.map((item: any) => item.text || "").join(" ");
        }
        // Handle table blocks
        else if (
          block.type === "table" &&
          block.content?.type === "tableContent"
        ) {
          const tableText: string[] = [];
          block.content.rows?.forEach((row: any) => {
            const rowText = row.cells
              ?.map(
                (cell: any) =>
                  cell.content?.map((item: any) => item.text || "").join(" ") ||
                  "",
              )
              .join(" | ");
            if (rowText) tableText.push(rowText);
          });
          return tableText.join("\n");
        }
        return "";
      })
      .filter(Boolean) // Remove empty strings
      .join("\n");
  } catch (error) {
    console.error("Error extracting plain text from BlockNote content:", error);
    // Nếu lỗi parse JSON, trả về content gốc nếu là string
    if (typeof content === "string") {
      return content;
    }
    return "Error parsing lesson content";
  }
}
