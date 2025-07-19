#!/bin/bash

echo "📦 Iniciando descarga de dependencias..."

# Crear carpetas si no existen
mkdir -p css js fonts

# Bootstrap CSS
curl -L -o css/bootstrap.min.css https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css

# Bootstrap Icons CSS
curl -L -o css/bootstrap-icons.css https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css

# Bootstrap Icons Fonts
curl -L -o fonts/bootstrap-icons.woff2 https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/fonts/bootstrap-icons.woff2
curl -L -o fonts/bootstrap-icons.woff https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/fonts/bootstrap-icons.woff

# Bootstrap Bundle JS (con Popper incluido)
curl -L -o js/bootstrap.bundle.min.js https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js

# jQuery
curl -L -o js/jquery.min.js https://code.jquery.com/jquery-3.7.1.min.js

# jQuery Sticky
curl -L -o js/jquery.sticky.js https://raw.githubusercontent.com/AnthonyLoye/jQuery.sticky/master/jquery.sticky.js

echo "Dependencias descargadas correctamente."
