import {
  EditorView,
  layer,
  RectangleMarker
} from "@codemirror/view"

export const activeSubline = layer({
  above: false,
  class: "cm-activeSublineLayer",
  update(update) {
    return (
      update.docChanged ||
      update.selectionSet ||
      update.geometryChanged ||
      update.viewportChanged
    )
  },
  markers(view) {
    const { main } = view.state.selection
    if (!main.empty) return []

    const start = view.moveToLineBoundary(main, false, true)
    const end = view.moveToLineBoundary(main, true, true)

    const fromCoords = view.coordsAtPos(start.from)
    if (!fromCoords) return []

    const scrollRect = view.scrollDOM.getBoundingClientRect()
    const contentRect = view.contentDOM.getBoundingClientRect()

    const top =
      fromCoords.top - scrollRect.top + view.scrollDOM.scrollTop
    const height = fromCoords.bottom - fromCoords.top

    const left =
      contentRect.left - scrollRect.left + view.scrollDOM.scrollLeft

    const width = view.scrollDOM.clientWidth - left - 1

    return [
      new RectangleMarker(
        "cm-activeSubline",
        left,
        top,
        Math.max(0, width),
        height
      )
    ]
  }
})

export const activeSublineTheme = EditorView.theme({
  ".cm-activeSubline": {
    border: "1px solid var(--active-sub-line-color)",
    borderRight: "none",
    boxSizing: "border-box",
    pointerEvents: "none",
  },
})