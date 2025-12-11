<?php
session_start();

// Inicializar carrito si no existe
if (!isset($_SESSION['cart'])) {
    $_SESSION['cart'] = [];
}

// Procesar acciones del carrito
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action'])) {
        switch ($_POST['action']) {
            case 'add_to_cart':
                $name = $_POST['name'];
                $price = floatval($_POST['price']);
                $type = $_POST['type'];
                
                $found = false;
                foreach ($_SESSION['cart'] as &$item) {
                    if ($item['name'] === $name) {
                        $item['quantity']++;
                        $found = true;
                        break;
                    }
                }
                
                if (!$found) {
                    $_SESSION['cart'][] = [
                        'name' => $name,
                        'price' => $price,
                        'type' => $type,
                        'quantity' => 1
                    ];
                }
                
                header('Content-Type: application/json');
                echo json_encode(['success' => true, 'cart' => $_SESSION['cart']]);
                exit;
                
            case 'update_quantity':
                $index = intval($_POST['index']);
                $change = intval($_POST['change']);
                
                if (isset($_SESSION['cart'][$index])) {
                    $_SESSION['cart'][$index]['quantity'] += $change;
                    
                    if ($_SESSION['cart'][$index]['quantity'] <= 0) {
                        array_splice($_SESSION['cart'], $index, 1);
                        $_SESSION['cart'] = array_values($_SESSION['cart']);
                    }
                }
                
                header('Content-Type: application/json');
                echo json_encode(['success' => true, 'cart' => $_SESSION['cart']]);
                exit;
                
            case 'remove_from_cart':
                $index = intval($_POST['index']);
                
                if (isset($_SESSION['cart'][$index])) {
                    array_splice($_SESSION['cart'], $index, 1);
                    $_SESSION['cart'] = array_values($_SESSION['cart']);
                }
                
                header('Content-Type: application/json');
                echo json_encode(['success' => true, 'cart' => $_SESSION['cart']]);
                exit;
                
            case 'checkout':
                if (!empty($_SESSION['cart'])) {
                    // Guardar compra en el historial
                    if (!isset($_SESSION['purchases'])) {
                        $_SESSION['purchases'] = [];
                    }
                    
                    $purchase = [
                        'id' => time(),
                        'date' => date('Y-m-d H:i:s'),
                        'items' => $_SESSION['cart'],
                        'total' => array_sum(array_map(function($item) {
                            return $item['price'] * $item['quantity'];
                        }, $_SESSION['cart']))
                    ];
                    
                    array_unshift($_SESSION['purchases'], $purchase);
                    $_SESSION['cart'] = [];
                    
                    header('Content-Type: application/json');
                    echo json_encode(['success' => true, 'purchase' => $purchase]);
                    exit;
                }
                break;
        }
    }
}

// Obtener información del carrito
if (isset($_GET['get_cart'])) {
    header('Content-Type: application/json');
    echo json_encode(['cart' => $_SESSION['cart']]);
    exit;
}

// Obtener historial de compras
if (isset($_GET['get_purchases'])) {
    header('Content-Type: application/json');
    echo json_encode(['purchases' => $_SESSION['purchases'] ?? []]);
    exit;
}

// Configuración del sitio
$site_config = [
    'site_name' => 'DYKSELIS',
    'tagline' => 'Velas Artesanales de Lujo',
    'location' => 'Ciudad del Carmen, Campeche, México',
    'phone' => '+52 938 277 5046',
    'email' => 'contacto@dykselis.com',
    'website' => 'staremulation.company.com',
    'instagram' => 'https://www.instagram.com/dykselis.store',
    'facebook' => 'https://www.facebook.com/share/1HQfV8ry46/',
    'whatsapp' => 'https://wa.me/529382775046'
];

// Productos
$products = [
    'velas' => [
        [
            'name' => 'Rosa Elegante',
            'description' => 'Aroma delicado de rosas frescas con toques de jazmín. Perfecta para crear ambientes románticos y sofisticados.',
            'price' => 100,
            'type' => 'vela',
            'image' => 'https://images.unsplash.com/photo-1602874801006-64c8b8025d45?w=800&q=80'
        ],
        [
            'name' => 'Lavanda Serenidad',
            'description' => 'Lavanda pura que promueve la relajación y el bienestar. Ideal para momentos de meditación y descanso.',
            'price' => 100,
            'type' => 'vela',
            'image' => 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80'
        ],
        [
            'name' => 'Vainilla Dulce',
            'description' => 'Vainilla natural con notas cálidas y acogedoras. Crea una atmósfera de confort y calidez en cualquier espacio.',
            'price' => 100,
            'type' => 'vela',
            'image' => 'https://images.unsplash.com/photo-1602874801006-e26d41f0ba1f?w=800&q=80'
        ]
    ],
    'jabones' => [
        [
            'name' => 'Jabón de Rosa',
            'description' => 'Jabón artesanal con aceites esenciales de rosa. Suaviza e hidrata la piel dejando un aroma floral delicado.',
            'price' => 100,
            'type' => 'jabón'
        ],
        [
            'name' => 'Jabón de Lavanda',
            'description' => 'Jabón relajante con lavanda pura. Propiedades calmantes para una experiencia de baño reconfortante.',
            'price' => 100,
            'type' => 'jabón'
        ],
        [
            'name' => 'Jabón de Vainilla',
            'description' => 'Jabón cremoso con extracto de vainilla natural. Nutre profundamente dejando la piel suave y perfumada.',
            'price' => 100,
            'type' => 'jabón'
        ]
    ]
];

include 'includes/header.php';
include 'includes/cart-sidebar.php';
?>

<div class="page-container">
    <!-- PÁGINA DE INICIO -->
    <div id="inicio" class="page active">
        <section class="hero">
            <div class="hero-content">
                <h1><?php echo $site_config['site_name']; ?></h1>
                <p class="subtitle"><?php echo $site_config['tagline']; ?></p>
                <p class="description">Creamos velas únicas elaboradas a mano con ingredientes naturales de la más alta calidad. Cada vela es una obra de arte diseñada para transformar tu espacio en un santuario de elegancia y tranquilidad.</p>
                <button class="btn" onclick="showPage('productos')">Explorar Colección</button>
            </div>
        </section>
    </div>

    <!-- PÁGINA DE COLECCIONES -->
    <div id="colecciones" class="page">
        <?php include 'pages/colecciones.php'; ?>
    </div>

    <!-- PÁGINA DE PRODUCTOS -->
    <div id="productos" class="page">
        <?php include 'pages/productos.php'; ?>
    </div>

    <!-- PÁGINA NOSOTROS -->
    <div id="nosotros" class="page">
        <?php include 'pages/nosotros.php'; ?>
    </div>

    <!-- PÁGINA DE COMPRAS -->
    <div id="compras" class="page">
        <?php include 'pages/compras.php'; ?>
    </div>

    <!-- PÁGINA DE CONTACTO -->
    <div id="contacto" class="page">
        <?php include 'pages/contacto.php'; ?>
    </div>

    <?php include 'includes/footer.php'; ?>
</div>

<?php include 'includes/receipt-modal.php'; ?>

<script src="assets/js/main.js"></script>

</body>
</html>