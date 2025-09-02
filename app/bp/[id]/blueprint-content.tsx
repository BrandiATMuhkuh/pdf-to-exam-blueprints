"use client";

import { BluePrintWithContent } from "./blueprint-types";

type BlueprintEdge = BluePrintWithContent["blueprint_edges"][number];

type TreeNode = {
  readonly edge: BlueprintEdge;
  readonly children: TreeNode[];
  depth: number;
};

function buildTree(nodes: readonly BlueprintEdge[]): TreeNode[] {
  const idToNode: Record<string, TreeNode> = {};
  const childrenByParent: Record<string, TreeNode[]> = {};
  const roots: TreeNode[] = [];

  for (const edge of nodes) {
    const node: TreeNode = { edge, children: [], depth: 0 };
    idToNode[edge.edget_id] = node;
  }

  for (const node of Object.values(idToNode)) {
    const parentId = node.edge.parent_id as string | null;
    if (!parentId) {
      roots.push(node);
      continue;
    }
    if (!childrenByParent[parentId]) {
      childrenByParent[parentId] = [];
    }
    childrenByParent[parentId].push(node);
  }

  const setDepthRecursively = (node: TreeNode, currentDepth: number): void => {
    node.depth = currentDepth;
    const children = childrenByParent[node.edge.edget_id] ?? [];
    node.children.push(
      ...children
        .sort(sortSiblings)
        .map((child) => ({ ...child, children: child.children, depth: currentDepth + 1 }))
    );
    for (const child of node.children) {
      setDepthRecursively(child, currentDepth + 1);
    }
  };

  for (const root of roots.sort(sortSiblings)) {
    setDepthRecursively(root, 0);
  }

  return roots;
}

function sortSiblings(a: TreeNode | BlueprintEdge, b: TreeNode | BlueprintEdge): number {
  const aEdge = isTreeNode(a) ? a.edge : a;
  const bEdge = isTreeNode(b) ? b.edge : b;
  const aPosition = typeof aEdge.position === "number" ? aEdge.position : Number.MAX_SAFE_INTEGER;
  const bPosition = typeof bEdge.position === "number" ? bEdge.position : Number.MAX_SAFE_INTEGER;
  if (aPosition !== bPosition) return aPosition - bPosition;
  const aTitle = aEdge.title ?? "";
  const bTitle = bEdge.title ?? "";
  return aTitle.localeCompare(bTitle);
}

function isTreeNode(value: TreeNode | BlueprintEdge): value is TreeNode {
  return (value as TreeNode).edge !== undefined;
}

function flattenTree(nodes: readonly TreeNode[]): readonly TreeNode[] {
  const ordered: TreeNode[] = [];
  const walk = (node: TreeNode): void => {
    ordered.push(node);
    for (const child of node.children) walk(child);
  };
  for (const root of nodes) walk(root);
  return ordered;
}

/**
 * Renders the blueprint edges as a hierarchical table.
 */
export function BlueprintContent({ blueprint }: { blueprint: BluePrintWithContent }) {
  const edges = blueprint.blueprint_edges;
  const parentTitleById: Record<string, string> = {};
  for (const edge of edges) {
    parentTitleById[edge.edget_id] = edge.title ?? "";
  }

  const tree = buildTree(edges);
  const ordered = flattenTree(tree);

  return (
    <div className="rounded-md border overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left p-2">Title</th>
            <th className="text-left p-2">Description</th>
            <th className="text-left p-2">Weight</th>
            <th className="text-left p-2">Position</th>
          </tr>
        </thead>
        <tbody>
          {ordered.map((node) => {
            const edge = node.edge;
            const indentPx = 12 + node.depth * 16;
            return (
              <tr key={edge.edget_id} className="border-t">
                <td className="p-2 align-top">
                  <div style={{ paddingLeft: indentPx }} className="flex items-start gap-2">
                    <span>{edge.title}</span>
                  </div>
                </td>
                <td className="p-2 align-top text-muted-foreground">{edge.description}</td>
                <td className="p-2 align-top">{edge.weight}</td>
                <td className="p-2 align-top">{edge.position}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}


