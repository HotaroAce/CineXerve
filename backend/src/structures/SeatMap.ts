export type SeatStatus = 'available' | 'reserved'

export class SeatMap {
  private map = new Map<string, SeatStatus>()
  private key(showtimeId: number, seatNumber: string): string {
    return `${showtimeId}-${seatNumber}`
  }
  set(showtimeId: number, seatNumber: string, status: SeatStatus) {
    this.map.set(this.key(showtimeId, seatNumber), status)
  }
  get(showtimeId: number, seatNumber: string): SeatStatus | undefined {
    return this.map.get(this.key(showtimeId, seatNumber))
  }
  has(showtimeId: number, seatNumber: string): boolean {
    return this.map.has(this.key(showtimeId, seatNumber))
  }
  delete(showtimeId: number, seatNumber: string) {
    this.map.delete(this.key(showtimeId, seatNumber))
  }
}
