import { ConflictException, Injectable, ServiceUnavailableException, UnprocessableEntityException } from '@nestjs/common';

import user_dataset from 'src/lib/data/users';
import { supabase } from 'src/lib/db';
import { CreateUserData } from './user.controller';
import * as bcrypt from "bcrypt"
import * as jose from 'jose'
import { ConfigModule } from '@nestjs/config';

@Injectable()
export class UserService {
    async getUsers():Promise<any>{
        const {data,error} = await supabase.from("user").select("*");
        if (error) {
            throw new ServiceUnavailableException(error.message)
        }

        return {
            ok:true,
            message:"Successfully fetched User Dataset",
            users:data
        }
        
    }
async createUser(data: CreateUserData): Promise<any> {
    // --- Input validation ---
    if (!data.name || data.name.length < 2) {
        throw new UnprocessableEntityException("Please provide a valid name");
    }
    if (!data.email || !data.email.includes("@")) {
        throw new UnprocessableEntityException("Please provide a valid email");
    }
    if (!data.password || data.password.length < 6) {
        throw new UnprocessableEntityException("Password must be at least 6 characters long");
    }
    if (!data.confirm_password) {
        throw new UnprocessableEntityException("Please provide a confirmation password");
    }
    if (data.password !== data.confirm_password) {
        throw new UnprocessableEntityException("Password and confirm password do not match");
    }

    // --- Check if user exists ---
    const { data: existingUser, error:dbErr } = await supabase
        .from('user')
        .select('*')
        .or(`email.eq.${data.email},name.eq.${data.name}`);

    if (dbErr) {
        throw new ServiceUnavailableException("Error checking existing users");
    }

    if (existingUser && existingUser.length > 0) {
        throw new ConflictException("User with this email or name already exists");
    }

    // --- Hash password ---
    const saltRounds = 10;
    let hashedPassword: string;
    try {
        const salt = await bcrypt.genSalt(saltRounds);
        hashedPassword = await bcrypt.hash(data.password, salt);
    } catch (err) {
        console.error('Error hashing password:', err);
        throw new ServiceUnavailableException("Failed to hash password");
    }

    // --- Build user payload ---
    const userPayload = {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        dob: data.dob,
        gender: data.gender,
        bio: data.bio,
        address: data.address
    };

    const {data:dbData,error} = await supabase.from("user").insert([userPayload]).select("id, name, bio, dob, gender, address, email").single()

    if (error) {
        throw new ConflictException(error.message);
    }
    const token_secret = process.env.TOKEN_SECRET!
    const secret = new TextEncoder().encode(
        token_secret
    )

    const alg = 'HS256'

    const jwt = await new jose.SignJWT({ uid: dbData?.id })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setIssuer('user')
    .setAudience('user')
    .setExpirationTime('3d')
    .sign(secret);
    return {
        ok: true,
        message: "Successfully created user dataset",
        user: dbData,
        jwt_token:jwt
    };
}

    getUser(id:string){
        return user_dataset.find((x)=>{
            return x.id === id;
        })
    }
}
