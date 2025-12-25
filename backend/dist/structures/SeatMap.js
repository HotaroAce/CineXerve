export class SeatMap {
    constructor() {
        this.map = new Map();
    }
    key(showtimeId, seatNumber) {
        return `${showtimeId}-${seatNumber}`;
    }
    set(showtimeId, seatNumber, status) {
        this.map.set(this.key(showtimeId, seatNumber), status);
    }
    get(showtimeId, seatNumber) {
        return this.map.get(this.key(showtimeId, seatNumber));
    }
    has(showtimeId, seatNumber) {
        return this.map.has(this.key(showtimeId, seatNumber));
    }
    delete(showtimeId, seatNumber) {
        this.map.delete(this.key(showtimeId, seatNumber));
    }
}
