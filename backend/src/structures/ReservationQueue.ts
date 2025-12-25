export type ReservationRequest = {
  userName: string
  showtimeId: number
  seatNumber: string
}

type QueueItem = {
  request: ReservationRequest
  resolve: (value: { bookingId: number } | PromiseLike<{ bookingId: number }>) => void
  reject: (reason?: any) => void
}

export class ReservationQueue {
  private queue: QueueItem[] = []
  enqueue(item: QueueItem) {
    this.queue.push(item)
  }
  dequeue(): QueueItem | undefined {
    return this.queue.shift()
  }
  isEmpty(): boolean {
    return this.queue.length === 0
  }
  size(): number {
    return this.queue.length
  }
}
