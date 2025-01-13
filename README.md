# Projekt-WDAI

## Dokumentacja

## Temat projektu: Prosty sklep internetowy

## Autorzy: <b> Szymon Balicki, Mateusz Nowak </b>

### Setup projektu

Projekt powstał z wykorzystaniem frameworku ReactJS.
Zostały w nim użyte biblioteki:

- React
- React DOM
- React Router DOM
- React Bootstrap
- React Bootstrap Icons
- Mongoose
- Express
- JSON Web Token
- BCryptJS
- CORS
- Body Parser
- Axios

#### Uruchomienie projektu

W sześciu terminalach należy wpisać poniższe komendy:

- W katalogu /sklep/src/microservices `node auth-service.js`
- W katalogu /sklep/src/microservices `node product-service.js`
- W katalogu /sklep/src/microservices `node order-service.js`
- W katalogu /sklep/src/microservices `node cart-service.js`
- W katalogu /sklep/src/microservices `node ratings-service.js`
- W katalogu /sklep `npm start`

### Struktura projektu

- `src/` - główny katalog źródłowy aplikacji
  - `pages/` - komponenty stron
    - `components/` - komponenty używane na stronach
    - `Cart.js` - strona koszyka
    - `Home.js` - strona główna
    - `NoPage.js` - strona 404
  - `microservices/` - mikroserwisy
    - `auth-service.js` - serwis autoryzacji
    - `cart-service.js` - serwis koszyka
    - `order-service.js` - serwis zamówień
    - `product-service.js` - serwis produktów
    - `ratings-service.js` - serwis ocen
  - `App.js` - główny komponent aplikacji
  - `index.js` - punkt wejściowy aplikacji

### Mikroserwisy

#### Auth Service

- Ścieżka: `src/microservices/auth-service.js`
- Port: 3001
- Funkcje:
  - Rejestracja użytkowników
  - Logowanie użytkowników
  - Generowanie tokenów JWT

#### Product Service

- Ścieżka: `src/microservices/product-service.js`
- Port: 3002
- Funkcje:
  - Dodawanie produktów
  - Pobieranie listy produktów
  - Pobieranie szczegółów produktu
  - Usuwanie produktów

#### Order Service

- Ścieżka: `src/microservices/order-service.js`
- Port: 3003
- Funkcje:
  - Tworzenie zamówień
  - Pobieranie zamówień użytkownika
  - Aktualizacja zamówień
  - Usuwanie zamówień

#### Ratings Service

- Ścieżka: `src/microservices/ratings-service.js`
- Port: 3004
- Funkcje:
  - Dodawanie ocen produktów
  - Pobieranie ocen produktów
  - Aktualizacja ocen
  - Usuwanie ocen

#### Cart Service

- Ścieżka: `src/microservices/cart-service.js`
- Port: 3005
- Funkcje:
  - Dodawanie produktów do koszyka
  - Pobieranie zawartości koszyka
  - Usuwanie produktów z koszyka
  - Aktualizacja ilości produktów w koszyku

### Komponenty

#### Account

- Ścieżka: `src/pages/components/Account.js`
- Opis: Panel użytkownika z możliwością wylogowania. Pobiera historię zamówień użytkownika

#### AuthContext

- Ścieżka: `src/pages/components/AuthContext.js`
- Opis: Komponent zapewniający autoryzację użytkownika

#### Login

- Ścieżka: `src/pages/components/Login.js`
- Opis: Formularz logowania użytkownika.

#### OrderList

- Ścieżka: `src/pages/components/OrderList.js`
- Opis: Tworzy listę zamówień dla danego użytkownika.

#### ProductDetail

- Ścieżka: `src/pages/components/ProductDetail.js`
- Opis: Wyświetla szczegóły wybranego produktu oraz umożliwia dodanie go do koszyka.

#### ProductList

- Ścieżka: `src/pages/components/ProductList.js`
- Opis: Wyświetla listę produktów z możliwością filtrowania.

#### ProductRatings

- Ścieżka: `src/pages/components/ProductRatings.js`
- Opis: Wyświetla opinie dla każdego produktu

#### ProtectedRoute

- Ścieżka: `src/pages/components/ProtectedRoute.js`
- Opis: Umożliwia korzystanie z niektórych komponentów tylko zautoryzowanym użytkownikom

#### RatingEditor

- Ścieżka: `src/pages/components/RatingEditor.js`
- Opis: Edytor opinii

#### Register

- Ścieżka: `src/pages/components/Register.js`
- Opis: Formularz rejestracji nowego użytkownika.

### Komponenty - strony

#### Cart

- Ścieżka: `src/pages/Cart.js`
- Opis: Wyświetla zawartość koszyka użytkownika z możliwością usuwania produktów.

#### Home

- Ścieżka: `src/pages/Home.js`
- Opis: Strona główna, wyświetla listę produktów z możliwością filtrowania i sortowania

#### Layout

- Ścieżka: `src/pages/Layout.js`
- Opis: Pasek nawigacji

#### NoPage

- Ścieżka: `src/pages/NoPage.js`
- Opis: Wyświetla się, gdy występuje błąd 404

### Style

Pliki `style.css`,`Cart.css`,`Layout.css` zawierają style dla wszystkich komponentów

### Podział pracy w ramach projektu

#### Szymon Balicki

- Komponenty
  - Account
  - AuthContext
  - Login
  - ProductDetail
  - ProductRatings
  - ProtectedRoute
  - RatingEditor
  - Register
  - Cart
  - Home
  - Layout
  - NoPage
- Style

#### Mateusz Nowak

- Komponenty
  - OrderList
  - ProductList
- Serwisy
  - Auth Service
  - Cart Service
  - Order Service
  - Product Service
  - Ratings Service
- Część administracyjna serwisu
- Dokumentacja Postman
