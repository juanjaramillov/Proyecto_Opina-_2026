import { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'

type Role = 'user' | 'admin' | 'b2b'

export function useRole() {
    const [role, setRole] = useState<Role>('user')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true

        async function run() {
            setLoading(true)

            const { data: authData, error: authErr } = await supabase.auth.getUser()
            if (authErr || !authData?.user) {
                if (mounted) {
                    setRole('user')
                    setLoading(false)
                }
                return
            }

            const uid = authData.user.id

            const { data, error } = await (supabase as any)
                .from('users')
                .select('role')
                .eq('user_id', uid)
                .single()

            if (mounted) {
                let fetchedRole = data?.role as string || 'user';
                // Compat map
                if (fetchedRole === 'enterprise') fetchedRole = 'b2b';

                setRole(fetchedRole as Role);
                setLoading(false)
            }

            if (error) {
                // si no existe fila aún, rol por defecto
                if (mounted) setRole('user')
            }
        }

        run()

        return () => {
            mounted = false
        }
    }, [])

    return { role, loading }
}
