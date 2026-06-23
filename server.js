const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

const app = express();
const PORT = 3000;

const USERS_FILE = "./data/users.json";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.use("/skins", express.static("skins"));
app.use("/capes", express.static("capes"));

if (!fs.existsSync("./data")) {
    fs.mkdirSync("./data");
}

if (!fs.existsSync("./skins")) {
    fs.mkdirSync("./skins");
}

if (!fs.existsSync("./capes")) {
    fs.mkdirSync("./capes");
}

if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(
        USERS_FILE,
        JSON.stringify([], null, 2)
    );
}

function loadUsers() {
    return JSON.parse(
        fs.readFileSync(USERS_FILE)
    );
}

function saveUsers(users) {
    fs.writeFileSync(
        USERS_FILE,
        JSON.stringify(users, null, 2)
    );
}

function createUUID(username) {
    return crypto
        .createHash("md5")
        .update("OfflinePlayer:" + username)
        .digest("hex");
}

const skinStorage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(null, "skins");

    },

    filename: function (req, file, cb) {

        const username =
            req.body.username;

        cb(
            null,
            username + ".png"
        );

    }

});

const capeStorage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(null, "capes");

    },

    filename: function (req, file, cb) {

        const username =
            req.body.username;

        cb(
            null,
            username + ".png"
        );

    }

});

const uploadSkin = multer({
    storage: skinStorage
});

const uploadCape = multer({
    storage: capeStorage
});

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );

});

app.post("/api/register", (req, res) => {

    const { username, password } = req.body;

    if (!username || !password) {

        return res.json({
            success: false,
            message: "Заполните все поля"
        });

    }

    const users = loadUsers();

    const exists = users.find(
        u => u.username === username
    );

    if (exists) {

        return res.json({
            success: false,
            message: "Ник уже занят"
        });

    }

    const uuid = createUUID(username);

    users.push({

        username,
        password,
        uuid,
        role: "user"

    });

    saveUsers(users);

    res.json({

        success: true,
        message: "Аккаунт создан"

    });

});

app.post("/api/login", (req, res) => {

    const { username, password } = req.body;

    const users = loadUsers();

    const user = users.find(
        u =>
            u.username === username &&
            u.password === password
    );

    if (!user) {

        return res.json({
            success: false,
            message: "Неверный логин или пароль"
        });

    }

    res.json({

        success: true,
        username: user.username,
        uuid: user.uuid,
        role: user.role

    });

});

app.get("/api/player/:username", (req, res) => {

    const username = req.params.username;

    const users = loadUsers();

    const user = users.find(
        u => u.username === username
    );

    if (!user) {

        return res.status(404).json({

            success: false,
            message: "Игрок не найден"

        });

    }

    res.json({

        username: user.username,
        uuid: user.uuid,
        role: user.role

    });

});

app.post(
    "/api/upload-skin",
    uploadSkin.single("skin"),
    (req, res) => {

        res.json({

            success: true,
            message: "Скин успешно загружен!"

        });

    }
);

app.post(
    "/api/upload-cape",
    uploadCape.single("cape"),
    (req, res) => {

        res.json({

            success: true,
            message: "Плащ успешно загружен!"

        });

    }
);

app.listen(PORT, () => {

    console.log("");
    console.log("================================");
    console.log("Brotan02 Skin Server");
    console.log("================================");
    console.log("");
    console.log(`http://localhost:${PORT}`);
    console.log("");

});