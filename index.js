const { WAConnection, MessageType } = require("@adiwajshing/baileys")
const fs = require("fs")
const http = require("http")
const qrcode = require("qrcode")
const express = require("express")
const socketIO = require("socket.io")

const port = 8000 || process.env.PORT
const wa = new WAConnection()
wa.version = [3, 3234, 9]
const app = express()
const server = http.createServer(app)
const io = socketIO(server)

listjadibot = [];

const jadibot = async(client) => {
io.on("connection", async socket => {
        socket.emit("log", "Connecting...")
        conn = new WAConnection()
    conn.logger.level = 'warn'
    conn.version = [2, 2123, 8]
    conn.browserDescription = [ 'Beebo Hosting', 'chrome', '3.0' ]
    conn.on('qr', async qr => {
        qrcode.toDataURL(qr, (err, url) => {
                        socket.emit("qr", url)
                        socket.emit("log", "QR Code received, please scan!")
        })
        setTimeout(() => {
                socket.emit("qr", url)
                socket.emit("log", "QR Code received, please scan!")
        },30000)
    })
    conn.on('connecting', () => {
    })
    conn.on('close', () => {
                socket.emit("qrstatus", "./assets/err.jpg")
                socket.emit("log", "Terputus")
    })
    conn.on('open', () => {
        socket.emit("qrstatus", "./assets/check.svg")
                socket.emit("log", "WhatsApp terhubung!")
                socket.emit("log", res)
    })
    await conn.connect({timeoutMs: 30 * 1000})
    listjadibot.push(conn.user)
    conn.on('chat-update', async (message) => {
        require('./client/plugins/bot.js')(conn, message)
    })
switch (wa.state) {
                case "close":
                        await wa.connect()
                        break
                case "open":
                        socket.emit("qrstatus", "./assets/check.svg")
                        socket.emit("log", "WhatsApp terhubung!")
                        break
                default:
                        socket.emit("log", wa.state)
}
})
}

const stopjadibot = (reply) => {
        conn = new WAConnection();
        conn.close()
        reply('Sukses stop jadibot')
}

wa.connectOptions.alwaysUseTakeover = false

app.use(express.json())
app.use(express.urlencoded({
  extended: true
}))
app.use("/assets", express.static(__dirname + "/client/assets"))

app.get("/", (req, res) => {
	res.sendFile("./client/server.html", {
		root: __dirname
	})
	jadibot(wa)
})

app.get("/client", (req, res) => {
	res.sendFile("./client/index.html", {
		root: __dirname
	})
})


app.post('/send-message', async (req, res) => {
  const message = req.body.message
  const number = req.body.number

  if (wa.state === "open") {
		const exists = await wa.isOnWhatsApp(number)

		if (exists) {
		  wa.sendMessage(exists.jid, message, MessageType.text)
		  	.then(result => {
			  	res.status(200).json({
				  	status: true,
				  	response: result
				  })
			  })
			  .catch(err => {
			  	res.status(500).json({
				  	status: false,
				  	response: err
				  })
			  })
		} else {
	    res.status(500).json({
	      status: false,
	      response: `Nomor ${number} tidak terdaftar.`
	    })
		}
  } else {
  	res.status(500).json({
      status: false,
      response: `WhatsApp belum terhubung.`
    })
  }
})

server.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`)
    console.log(`Aplikasi Client di http://localhost:${port}/client`)
})
