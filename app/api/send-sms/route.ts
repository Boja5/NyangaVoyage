import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

// This is a Next.js API route — it runs on the SERVER not the browser
// That means our Twilio credentials are never exposed to the public
export async function POST(req: NextRequest) {
  try {
    const { to, bookingRef, origin, destination, departureTime, agencyName, busClass, seatNumber } = await req.json()

    // Create Twilio client using our secret credentials
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    )

    // Format the departure time nicely
    const formattedTime = new Date(departureTime).toLocaleString('fr-CM', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })

    // Build the SMS message
    const message = `NyangaVoyage ✓ Booking Confirmed!
Ref: ${bookingRef}
${origin} → ${destination}
${formattedTime}
${agencyName} | ${busClass} | Seat ${seatNumber}
Show this reference at the bus station.`

    // Send the SMS via Twilio
    await client.messages.create({
      body: message,
      messagingServiceSid: process.env.TWILIO_MESSAGING_SID,
      to: `+237${to.replace(/\s/g, '')}`, // add Cameroon country code and remove spaces
    })

    return NextResponse.json({ success: true })

  } catch (error: unknown) {
    console.error('SMS error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}