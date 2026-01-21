import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const transactions = await prisma.transaction.findMany({
            where: {
                userId: (session.user as any).id,
            },
            orderBy: {
                date: 'desc',
            },
        });
        return NextResponse.json(transactions);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { amount, type, category, description, date } = body;

        const transaction = await prisma.transaction.create({
            data: {
                amount: Number(amount),
                type,
                category,
                description: description || '',
                date: new Date(date),
                userId: (session.user as any).id,
            },
        });

        return NextResponse.json(transaction);
    } catch (error) {
        console.error("Transaction Error", error);
        return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
    }
}
