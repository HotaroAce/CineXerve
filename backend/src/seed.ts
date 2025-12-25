import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createSeats(showtimeId: number) {
  const rows = ['A', 'B', 'C', 'D']
  const seats: { showtimeId: number; seatNumber: string; status: string }[] = []
  for (const r of rows) {
    for (let n = 1; n <= 10; n++) {
      seats.push({ showtimeId, seatNumber: `${r}${n}`, status: 'available' })
    }
  }
  await prisma.seat.createMany({ data: seats })
}

async function main() {
  await prisma.booking.deleteMany({})
  await prisma.seat.deleteMany({})
  await prisma.showtime.deleteMany({})
  await prisma.movie.deleteMany({})

  const data = [
    { title: 'Interstellar', genre: 'Sci-Fi', duration: 169, description: 'Space epic' },
    { title: 'Inception', genre: 'Sci-Fi', duration: 148, description: 'Mind-bending heist' },
    { title: 'The Dark Knight', genre: 'Action', duration: 152, description: 'Gotham vigilante' },
    { title: 'Parasite', genre: 'Thriller', duration: 132, description: 'Class satire' },
    { title: 'La La Land', genre: 'Romance', duration: 128, description: 'Musical love story' },
    { title: 'Avengers: Endgame', genre: 'Action', duration: 181, description: 'Epic finale' },
    { title: 'Dune', genre: 'Sci-Fi', duration: 155, description: 'Desert saga' },
    { title: 'Coco', genre: 'Animation', duration: 105, description: 'Family and music' },
    { title: 'Spirited Away', genre: 'Animation', duration: 125, description: 'Fantasy adventure' },
    { title: 'Whiplash', genre: 'Drama', duration: 106, description: 'Obsession and jazz' },
    { title: 'The Godfather', genre: 'Crime', duration: 175, description: 'Mafia dynasty' },
    { title: 'The Shawshank Redemption', genre: 'Drama', duration: 142, description: 'Hope and freedom' },
    { title: 'Titanic', genre: 'Romance', duration: 195, description: 'Tragic voyage' },
    { title: 'Mad Max: Fury Road', genre: 'Action', duration: 120, description: 'Post-apocalyptic chase' },
    { title: 'The Matrix', genre: 'Sci-Fi', duration: 136, description: 'Virtual reality' },
    { title: 'Get Out', genre: 'Horror', duration: 104, description: 'Social horror' },
    { title: 'Toy Story', genre: 'Animation', duration: 81, description: 'Toys come alive' },
    { title: 'Joker', genre: 'Crime', duration: 122, description: 'Origin story' },
    { title: 'Blade Runner 2049', genre: 'Sci-Fi', duration: 164, description: 'Neo-noir future' },
    { title: 'The Lion King', genre: 'Animation', duration: 88, description: 'Circle of life' },
  ]
  const created = []
  for (const m of data) {
    const movie = await prisma.movie.create({ data: m })
    created.push(movie)
  }
  for (const movie of created) {
    const s = await prisma.showtime.create({
      data: { movieId: movie.id, datetime: new Date(Date.now() + 24 * 3600 * 1000), cinema: 'Hall 1' },
    })
    await createSeats(s.id)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
