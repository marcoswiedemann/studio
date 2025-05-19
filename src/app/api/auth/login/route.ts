
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { Credentials, User } from '@/types';

// ATENÇÃO: Em uma aplicação real, você DEVE hashear senhas antes de armazená-las
// e comparar senhas hasheadas durante o login. Bibliotecas como bcryptjs são comuns para isso.
// Este exemplo usa senhas em texto plano para simplicidade e PRECISA ser protegido.

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

    // !!! ALERTA DE SEGURANÇA: Comparação de senha em texto plano !!!
    // Substitua isto por uma comparação de senha hashada (ex: usando bcrypt.compare)
    const isValidPassword = userFromDb.password === password;

    if (!isValidPassword) {
      return NextResponse.json({ message: 'Usuário ou senha inválidos.' }, { status: 401 });
    }

    // Não envie a senha de volta para o cliente
    const { password: _, ...userToReturn } = userFromDb;
    
    // Mapear para o tipo User do frontend, convertendo Date para string se necessário
    const clientUser: User = {
        id: userToReturn.id,
        username: userToReturn.username,
        name: userToReturn.name,
        role: userToReturn.role, // O enum UserRole do Prisma é compatível
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
