const FooterHome = () => {
  return (
    <footer className="text-base-content body-font">
      <div className="container px-5 py-8 mx-auto flex items-center sm:flex-row flex-col">
        <a
          className="flex title-font font-medium items-center md:justify-start justify-center text-base-900"
          href="/"
        >
          <span className="text-blue-700 text-xl font-bold">Factu</span>
          <span className="text-orange-500 text-xl font-bold">Flexe</span>
        </a>
        <p className="text-sm text-base-500 sm:ml-4 sm:pl-4 sm:border-l-2 sm:border-base-200 sm:py-2 sm:mt-0 mt-4">
          © 2024 FactuFlexe —
          <a
            href=""
            className="text-base-600 ml-1"
            rel="noopener noreferrer"
            target="_blank"
          >
            @AB
          </a>
        </p>
        <span className="inline-flex sm:ml-auto sm:mt-0 mt-4 justify-center sm:justify-start">
          <a className="text-gray-500" href="/">
            {/* Facebook Icon */}
          </a>
          <a className="ml-3 text-gray-500" href="/">
            {/* Twitter Icon */}
          </a>
          <a className="ml-3 text-gray-500" href="/">
            {/* Instagram Icon */}
          </a>
          <a className="ml-3 text-gray-500" href="/">
            {/* LinkedIn Icon */}
          </a>
        </span>
      </div>
    </footer>
  )
}

export default FooterHome
