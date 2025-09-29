const validatorEmail = (email: string) => {
    return email?.toString().includes("@") && email?.toString().includes(".");
}

const validatorPassword = (password: string) => {
    return password?.toString().length >= 8;
}

export { validatorEmail, validatorPassword };