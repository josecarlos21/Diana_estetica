import express from 'express'
import cors from 'cors'
import serviceRoutes from './routes/services'
import stylistRoutes from './routes/stylists'
import bookingRoutes from './routes/bookings'
import consultationRoutes from './routes/consultations'

const app = express()
const port = 3002

app.use(cors())
app.use(express.json())

app.use('/api/services', serviceRoutes)
app.use('/api/stylists', stylistRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/consultations', consultationRoutes)

app.listen(port, () => {
    console.log(`Backend running at http://localhost:${port}`)
})
