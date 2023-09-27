"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountVerification = exports.firstAccountVerification = exports.getSingleAccount = exports.allAccount = exports.createAccount = void 0;
const client_1 = require("@prisma/client");
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const email_1 = require("../utils/email");
const prisma = new client_1.PrismaClient();
const createAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const tokenValue = crypto_1.default.randomBytes(2).toString("hex");
        const secretKey = crypto_1.default.randomBytes(2).toString("hex");
        const token = jsonwebtoken_1.default.sign(tokenValue, "token");
        const account = yield prisma.crowdAuth.create({
            data: {
                email,
                password,
                secretKey,
                token,
                profile: [],
                abeg: [],
            },
        });
        (0, email_1.sendFirstEmail)(account).then(() => {
            console.log("Mail Sent...");
        });
        return res.status(201).json({
            message: "Your Account has been created successfully",
            data: account,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error",
            data: error,
        });
    }
});
exports.createAccount = createAccount;
const allAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const account = yield prisma.crowdAuth.findMany({});
        return res.status(200).json({
            message: "Viewing all Account",
            data: account,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error",
            data: error,
        });
    }
});
exports.allAccount = allAccount;
const getSingleAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { accountID } = req.params;
        const account = yield prisma.crowdAuth.findUnique({
            where: { id: accountID },
        });
        return res.status(200).json({
            message: "Viewing single Account",
            data: account,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error",
            data: error,
        });
    }
});
exports.getSingleAccount = getSingleAccount;
const firstAccountVerification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { secretKey } = req.body;
        const { token } = req.params;
        jsonwebtoken_1.default.verify(token, "secret", (error, payload) => __awaiter(void 0, void 0, void 0, function* () {
            if (error) {
                throw new Error();
            }
            else {
                const account = yield prisma.crowdAuth.findUnique({
                    where: { id: payload.id },
                });
                if ((account === null || account === void 0 ? void 0 : account.secretKey) === secretKey) {
                    (0, email_1.sendSecondEmail)(account).then(() => {
                        console.log("Mail Sent...");
                    });
                    return res.status(200).json({
                        message: "PLease to verify your Account",
                    });
                }
                else {
                    return res.status(404).json({
                        message: "Error with your Token",
                    });
                }
            }
        }));
    }
    catch (error) {
        return res.status(404).json({
            message: "Error",
        });
    }
});
exports.firstAccountVerification = firstAccountVerification;
const accountVerification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        jsonwebtoken_1.default.verify(token, "secret", (error, payload) => __awaiter(void 0, void 0, void 0, function* () {
            if (error) {
                throw new Error();
            }
            else {
                const account = yield prisma.crowdAuth.findUnique({
                    where: { id: payload.id },
                });
                if (account) {
                    yield prisma.crowdAuth.update({
                        where: { id: payload.id },
                        data: {
                            token: "",
                            verify: true,
                        },
                    });
                    return res.status(200).json({
                        message: "Congratulation your account has been Verifify!!!",
                    });
                }
                else {
                    return res.status(404).json({
                        message: "Error with your Token",
                    });
                }
            }
        }));
    }
    catch (error) {
        return res.status(404).json({
            message: "Error",
        });
    }
});
exports.accountVerification = accountVerification;
