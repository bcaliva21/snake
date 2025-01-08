const GRID_SIZE = 21
export function randomGridPosition(): { x: number; y: number } {
    return {
        x: Math.floor(Math.random() * GRID_SIZE) + 1,
        y: Math.floor(Math.random() * GRID_SIZE) + 1
    }
}
export function outsideGrid(position: { x: number; y: number }): boolean {
    return (
        position.x < 1 || position.x > GRID_SIZE ||
        position.y < 1 || position.y > GRID_SIZE
    )

}
