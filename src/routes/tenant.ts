import express, { Request, Response } from "express";

const router = express.Router();

router.post("", (req: Request, res: Response) => {
    res.status(201).json({});
});

export default router;
