'use client'

import { useState } from 'react'
import { Button, TextField, Grid, Card, CardContent } from '@mui/material'
import { api } from '@/utils/axiosInstance' // Assuming you have a configured axios instance
import endPointApi from '@/utils/endPointApi'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux-store'
import { toast } from 'react-toastify'

interface MailConfig {
    mailer: string;
    host: string;
    port: string;
    username: string;
    password: string;
    from_address: string;
    encryption: string;
    from_name: string;
}

const EmailCredentialsForm = () => {
    const loginStore = useSelector((state: RootState) => state.login);
    console.log("loginStore", loginStore);

    const [mailConfig, setMailConfig] = useState<MailConfig>({
        mailer: '',
        host: '',
        port: '',
        username: '',
        password: '',
        from_address: '',
        encryption: '',
        from_name: ''
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<any>({});

    // Handle changes in input fields
    const handleChange = (key: keyof MailConfig, value: string) => {
        setMailConfig(prev => ({ ...prev, [key]: value }));
    };

    // Validation function
    const validateForm = () => {
        const newErrors: any = {};
        if (!mailConfig.mailer) newErrors.mailer = 'Mailer is required';
        if (!mailConfig.host) newErrors.host = 'Host is required';
        if (!mailConfig.port) newErrors.port = 'Port is required';
        if (!mailConfig.username) newErrors.username = 'Username is required';
        if (!mailConfig.password) newErrors.password = 'Password is required';
        if (!mailConfig.from_address) newErrors.from_address = 'Form Address is required';
        if (!mailConfig.encryption) newErrors.encryption = 'Encryption is required';
        if (!mailConfig.from_name) newErrors.from_name = 'Form Name is required';
        return newErrors;
    };

    // Submit form
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formErrors = validateForm();
        setErrors(formErrors);
        if (Object.keys(formErrors).length > 0) return;

        try {
            setLoading(true);

            const body = {
                school_id: loginStore.school_id,
                tenant_id: loginStore.tenant_id,
                mailer: mailConfig.mailer,
                host: mailConfig.host,
                port: mailConfig.port,
                username: mailConfig.username,
                password: mailConfig.password,
                from_address: mailConfig.from_address,
                encryption: mailConfig.encryption,
                from_name: mailConfig.from_name
            };

            const res = await api.post(endPointApi.postEmailSetting, body, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (res.data?.status === 200) {
                toast.success(res.data.message)
            } else {
                alert('Error saving email settings.');
            }
        } catch (error: any) {
            console.error("Error during form submission:", error);
        } finally {
            setLoading(false); // End loading
        }
    };

    return (
        <Card>
            <CardContent>
                <form onSubmit={onSubmit}>
                    <Grid container spacing={5}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Mailer"
                                placeholder="Mailer"
                                value={mailConfig.mailer}
                                onChange={(e) => handleChange('mailer', e.target.value)}
                                error={!!errors.mailer}
                                helperText={errors.mailer}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Host"
                                placeholder="smtp.hostinger.in"
                                value={mailConfig.host}
                                onChange={(e) => handleChange('host', e.target.value)}
                                error={!!errors.host}
                                helperText={errors.host}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Port"
                                placeholder="0000"
                                value={mailConfig.port}
                                onChange={(e) => handleChange('port', e.target.value)}
                                error={!!errors.port}
                                helperText={errors.port}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Username"
                                placeholder="johndoe@example.com"
                                value={mailConfig.username}
                                onChange={(e) => handleChange('username', e.target.value)}
                                error={!!errors.username}
                                helperText={errors.username}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Password"
                                placeholder="********"
                                value={mailConfig.password}
                                onChange={(e) => handleChange('password', e.target.value)}
                                type="password"
                                error={!!errors.password}
                                helperText={errors.password}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Form Address"
                                placeholder="johndoe@example.com"
                                value={mailConfig.from_address}
                                onChange={(e) => handleChange('from_address', e.target.value)}
                                error={!!errors.from_address}
                                helperText={errors.from_address}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Encryption"
                                placeholder="Encryption"
                                value={mailConfig.encryption}
                                onChange={(e) => handleChange('encryption', e.target.value)}
                                error={!!errors.encryption}
                                helperText={errors.encryption}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Form Name"
                                placeholder="form name"
                                value={mailConfig.from_name}
                                onChange={(e) => handleChange('from_name', e.target.value)}
                                error={!!errors.from_name}
                                helperText={errors.from_name}
                            />
                        </Grid>

                        <Grid item xs={12} className="flex gap-4 flex-wrap pbs-6">
                            <Button variant="contained" type="submit" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                            <Button variant="outlined" type="reset" color="secondary">
                                Cancel
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </CardContent>
        </Card>
    )
}

export default EmailCredentialsForm;
