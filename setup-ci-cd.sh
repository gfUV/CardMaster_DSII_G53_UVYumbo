#!/bin/bash

# Script de instalación y configuración del pipeline CI/CD
# CardMaster - Grupo 53 UV Yumbo

echo "🚀 Configurando pipeline CI/CD para CardMaster..."
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ==========================================
# 1. Verificar Node.js
# ==========================================
echo -e "${BLUE}1. Verificando Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    echo "Por favor instala Node.js desde https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✅ Node.js instalado: $NODE_VERSION${NC}"
echo ""

# ==========================================
# 2. Instalar dependencias root
# ==========================================
echo -e "${BLUE}2. Instalando dependencias del root (Husky, lint-staged)...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error instalando dependencias root${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Dependencias root instaladas${NC}"
echo ""

# ==========================================
# 3. Instalar dependencias backend
# ==========================================
echo -e "${BLUE}3. Instalando dependencias del backend...${NC}"
cd backend
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error instalando dependencias backend${NC}"
    exit 1
fi

# Instalar dependencias de desarrollo adicionales
npm install --save-dev eslint jest supertest @types/jest

echo -e "${GREEN}✅ Dependencias backend instaladas${NC}"
cd ..
echo ""

# ==========================================
# 4. Instalar dependencias frontend
# ==========================================
echo -e "${BLUE}4. Instalando dependencias del frontend...${NC}"
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error instalando dependencias frontend${NC}"
    exit 1
fi

# Instalar Prettier
npm install --save-dev prettier

echo -e "${GREEN}✅ Dependencias frontend instaladas${NC}"
cd ..
echo ""

# ==========================================
# 5. Configurar Husky
# ==========================================
echo -e "${BLUE}5. Configurando Husky (Git hooks)...${NC}"
npm run prepare
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error configurando Husky${NC}"
    exit 1
fi

# Dar permisos de ejecución al hook
chmod +x .husky/pre-commit

echo -e "${GREEN}✅ Husky configurado${NC}"
echo ""

# ==========================================
# 6. Crear directorio de tests si no existe
# ==========================================
echo -e "${BLUE}6. Configurando estructura de pruebas...${NC}"
mkdir -p backend/tests
echo -e "${GREEN}✅ Estructura de pruebas lista${NC}"
echo ""

# ==========================================
# 7. Verificar archivos de configuración
# ==========================================
echo -e "${BLUE}7. Verificando archivos de configuración...${NC}"

FILES_TO_CHECK=(
    ".github/workflows/ci.yml"
    ".husky/pre-commit"
    "backend/.eslintrc.json"
    "backend/tests/auth.test.js"
    "frontend/.prettierrc.json"
)

MISSING_FILES=0
for file in "${FILES_TO_CHECK[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${YELLOW}⚠️  Falta crear: $file${NC}"
        MISSING_FILES=$((MISSING_FILES + 1))
    else
        echo -e "${GREEN}✅ $file${NC}"
    fi
done

if [ $MISSING_FILES -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Faltan $MISSING_FILES archivos de configuración${NC}"
    echo "Por favor crea los archivos faltantes usando los artifacts proporcionados"
else
    echo -e "${GREEN}✅ Todos los archivos de configuración están presentes${NC}"
fi
echo ""

# ==========================================
# 8. Ejecutar prueba de validaciones
# ==========================================
echo -e "${BLUE}8. Ejecutando prueba de validaciones...${NC}"

echo "  → Lint backend..."
cd backend
if npm run lint --silent; then
    echo -e "${GREEN}  ✅ Backend lint OK${NC}"
else
    echo -e "${YELLOW}  ⚠️  Backend lint encontró warnings${NC}"
fi

echo "  → Tests backend..."
if npm test -- --passWithNoTests --silent; then
    echo -e "${GREEN}  ✅ Backend tests OK${NC}"
else
    echo -e "${YELLOW}  ⚠️  Backend tests necesitan atención${NC}"
fi
cd ..

echo "  → TypeScript check frontend..."
cd frontend
if npx tsc --noEmit --silent 2>/dev/null; then
    echo -e "${GREEN}  ✅ Frontend TypeScript OK${NC}"
else
    echo -e "${YELLOW}  ⚠️  Frontend TypeScript encontró warnings${NC}"
fi
cd ..

echo ""

# ==========================================
# 9. Configurar GitHub Secrets
# ==========================================
echo -e "${BLUE}9. Recordatorio: Configurar GitHub Secrets${NC}"
echo ""
echo "Debes configurar estos secrets en GitHub:"
echo "  → Settings > Secrets and variables > Actions > New repository secret"
echo ""
echo "Secrets requeridos:"
echo "  • RENDER_BACKEND_SERVICE_ID"
echo "  • RENDER_FRONTEND_SERVICE_ID"
echo "  • RENDER_API_KEY"
echo ""

echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                        ║${NC}"
echo -e "${GREEN}║  ✅ Configuración CI/CD completada exitosamente       ║${NC}"
echo -e "${GREEN}║                                                        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo -e "${GREEN}¡Éxito! 🎉${NC}"