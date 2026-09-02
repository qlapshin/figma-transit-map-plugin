figma.showUI(__html__, { width: 426, height: 440, title: "Transit Map Builder" });

// Listen for messages from ui.html
figma.ui.onmessage = (msg) => {
  if (msg.type === 'insert-svg') {
    let svgFrame: FrameNode | null = null;

    try {
      // Import the SVG into a temporary frame
      svgFrame = figma.createNodeFromSvg(msg.svgCode);
      
      // Position the temporary frame in the center of the current view
      svgFrame.x = figma.viewport.center.x - (svgFrame.width / 2);
      svgFrame.y = figma.viewport.center.y - (svgFrame.height / 2);
      figma.currentPage.appendChild(svgFrame);

      if (svgFrame.children.length === 0) {
        throw new Error("SVG has no vector content");
      }

      // Flatten all imported layers into one VectorNode
      const vectorNode = figma.flatten([...svgFrame.children], svgFrame);

      // Preserve the vector's visual position when moving it out of the frame
      const vectorX = svgFrame.x + vectorNode.x;
      const vectorY = svgFrame.y + vectorNode.y;

      figma.currentPage.appendChild(vectorNode);
      vectorNode.x = vectorX;
      vectorNode.y = vectorY;
      vectorNode.name = msg.name || "SVG";
      
      // Remove the now-empty temporary frame
      svgFrame.remove();
      svgFrame = null;
      
      // Select the resulting vector
      figma.currentPage.selection = [vectorNode];
      
      figma.notify("SVG inserted as vector!");

    } catch (error) {
      if (svgFrame && !svgFrame.removed) {
        svgFrame.remove();
      }

      console.error("Failed to insert SVG:", error);
      figma.notify("Error: Invalid SVG code.", { error: true });
    }
  }
};
