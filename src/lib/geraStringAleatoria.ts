export function geraStringAleatoria(tamanho: number) {
  let stringAleatoria = "";
  const caracteres = "0123456789";
  for (let i = 0; i < tamanho; i++) {
    stringAleatoria += caracteres.charAt(
      Math.floor(Math.random() * caracteres.length)
    );
  }
  return stringAleatoria;
}