const PaymentButton = () => {
  const handlePayment = () => {
    const apiUrl = import.meta.env.VITE_APP_API_BASE_URL
    fetch(`${apiUrl}/api/payment/create-payment`, { method: 'POST' })
      .then((response) => response.json())
      .then((data) => {
        console.log(data)
        if (data.url) {
          // Redirige l'utilisateur vers l'URL de paiement PayDunya
          window.location.href = data.url
        } else {
          // Gérer le cas où l'URL n'est pas retournée
          console.error('URL de paiement non reçue.')
        }
      })
      .catch((error) => {
        // Gérer les erreurs ici
        console.error('Erreur lors de la requête de paiement:', error)
      })
  }

  return <button onClick={handlePayment}>Payer avec PayDunya</button>
}

export default PaymentButton
