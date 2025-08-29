// // app/api/school/route.ts

// export async function POST(req: Request) {
//   try {
//     // ⛳ Parse incoming multipart/form-data (from frontend)
//     const form = await req.formData()
//     const type = form.get('type')

//     if (!type) {
//       return new Response(JSON.stringify({ error: 'Missing type field' }), {
//         status: 400,
//         headers: { 'Content-Type': 'application/json' }
//       })
//     }

//     // 🎯 Prepare form-urlencoded body for external API
//     const formData = new URLSearchParams()
//     formData.append('type', String(type))

//     // 🔁 Forward the request to external API
//     const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded'
//       },
//       body: formData
//     })

//     const text = await response.text()

//     try {
//       const data = JSON.parse(text)
//       return new Response(JSON.stringify(data), {
//         status: 200,
//         headers: { 'Content-Type': 'application/json' }
//       })
//     } catch (jsonError) {
//       return new Response(
//         JSON.stringify({
//           error: 'External API did not return valid JSON',
//           raw: text
//         }),
//         { status: 502, headers: { 'Content-Type': 'application/json' } }
//       )
//     }
//   } catch (error: any) {
//     return new Response(
//       JSON.stringify({ error: 'Proxy failed', details: error.message }),
//       { status: 500, headers: { 'Content-Type': 'application/json' } }
//     )
//   }
// }
