
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { Credentials, User } from '@/types';

// IMPORTANT: In a real application, you MUST hash passwords before storing them
// and compare hashed passwords during login. Libraries like bcryptjs are common for this.
// This example uses plain text passwords for simplicity to match the initial setup
// and needs to be secured.

export async function POST(req: NextRequest) {
  try {
    const { username, password } = (await req.json()) as Credentials;

    if (!username || !password) {
      return NextResponse.json({ message: 'Usuário e senha são obrigatórios.' }, { status: 400 });
    }

    const userFromDb = await prisma.user.findUnique({
      where: { username },
    });

    if (!userFromDb) {
      return NextResponse.json({ message: 'Usuário ou senha inválidos.' }, { status: 401 });
    }

    // !!! SECURITY WARNING: Plain text password comparison !!!
    // Replace this with a hashed password comparison (e.g., using bcrypt.compare)
    const isValidPassword = userFromDb.password === password;

    if (!isValidPassword) {
      return NextResponse.json({ message: 'Usuário ou senha inválidos.' }, { status: 401 });
    }

    // Do not send the password back to the client
    const { password: _, ...userToReturn } = userFromDb;
    
    const clientUser: User = {
        id: userToReturn.id,
        username: userToReturn.username,
        name: userToReturn.name,
        role: userToReturn.role, // Prisma's UserRole enum is compatible
        canViewCalendarsOf: userToReturn.canViewCalendarsOf,
        createdAt: userToReturn.createdAt.toISOString(),
        updatedAt: userToReturn.updatedAt.toISOString(),
    };


    return NextResponse.json({ user: clientUser, message: 'Login bem-sucedido!' }, { status: 200 });
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}
