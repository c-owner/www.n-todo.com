import useErrorMapper from '~/composables/useErrorMapper'
import { AuthSession } from '~/types/AuthSession'
import { useFetch, useRouter, useState } from "#app";
import { AuthUser } from "~/types/AuthUser";

export const useAuthCookie = () => useCookie('auth_token')

export async function useUser(): Promise<AuthUser | null> {
    const authCookie = useAuthCookie().value
    const user = useState<AuthUser | null>('user')

    if (authCookie && !user.value) {

        const cookieHeaders = useRequestHeaders(['cookie'])

        const { data } = await useFetch<AuthUser>(`/api/auth/getByAuthToken`, {
            headers: cookieHeaders as HeadersInit,
        })

        user.value = data.value
    }

    return user.value
}

export async function useLoggedIn() {
    const user = await useUser()

    if (!user) {
        return false
    }

    if (user?.id == null) {
        return false
    }

    return true
}

export async function userLogout() {
    await useFetch('/api/auth/logout')
    useState('user').value = null
    await useRouter().push('/')
}{}

export async function registerWithEmail(
    username: string,
    name: string,
    email: string,
    password: string
): Promise<FormValidation> {
    try {
        const data = await $fetch<AuthSession>('/api/auth/register', {
            method: 'POST',
            body: { username, name, email, password }
        })

        if (data) {
            useState('user').value = data
            await useRouter().push('/')
        }
        return { hasErrors: false, loggedIn: true }
    } catch (error: any) {
        return useErrorMapper(error.data.data)
    }
}
