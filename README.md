````md
# TACO Viewer

Interface web moderna para visualização interativa da **TACO – Tabela Brasileira de Composição de Alimentos (4ª edição ampliada e revisada)**.

O projeto transforma bases em **JSON** ou **CSV** em uma experiência rápida, organizada e intuitiva para consulta nutricional.

---

## Visão Geral

A proposta do sistema é converter dados técnicos de alimentos em uma interface visual profissional, facilitando:

- pesquisa nutricional
- consulta rápida de alimentos
- comparação de nutrientes
- exploração por categorias
- uso educacional
- estudos em nutrição
- análise de dados alimentares

---

## Principais Recursos

## Importação de Arquivos

Suporte para:

- `.json`
- `.csv`

Métodos:

- selecionar arquivo local
- arrastar e soltar

---

## Visualização em Galeria

Cada alimento é exibido em cards contendo:

- imagem
- nome
- categoria
- calorias
- proteína
- carboidratos
- gordura

---

## Painel Lateral Inteligente

Ao clicar em um card:

abre um painel lateral com detalhes completos:

- composição nutricional
- vitaminas
- minerais
- aminoácidos
- ácidos graxos
- umidade
- código/id
- categoria

---

## Busca em Tempo Real

Pesquisa instantânea por:

- nome
- categoria
- nutrientes
- palavras parciais

---

## Filtros

Permite filtrar por:

- categoria
- calorias
- proteína
- carboidrato
- gordura
- favoritos

---

## Comparador Nutricional

Compare alimentos lado a lado.

Exemplo:

- arroz integral vs arroz branco
- leite integral vs desnatado

---

## Favoritos

Marque alimentos importantes.

Salvo em:

```text
localStorage
````

---

## Exportação

Permite exportar:

* favoritos JSON
* lista filtrada CSV
* dataset tratado

---

## Interface Moderna

* design limpo
* dark mode
* animações suaves
* responsivo
* rápido
* organizado

---

# Estrutura do Projeto

```text
TACO-Viewer/
│── index.html
│── style.css
│── script.js
│── README.md
```

---

# Formato JSON Compatível

```json
{
  "metadados": {},
  "categorias": [],
  "alimentos": []
}
```

---

# Formato CSV Compatível

```csv
id,nome,categoria,energia_kcal,proteina_g,carboidrato_g
1,Arroz integral,Cereais,124,2.6,25.8
```

---

# Como Usar

## Método Simples

Abra:

```text
index.html
```

no navegador.

---

## Método Recomendado

Rodar servidor local:

```bash
python -m http.server
```

Depois:

```text
http://localhost:8000
```

---

# Tecnologias Utilizadas

* HTML5
* CSS3
* JavaScript Vanilla
* LocalStorage

---

# Fonte de Dados

Base utilizada:

**TACO – Tabela Brasileira de Composição de Alimentos**
4ª edição ampliada e revisada.

---

# Casos de Uso

* nutricionistas
* estudantes
* academia
* dieta
* pesquisa científica
* dashboards alimentares
* apps fitness
* análise de nutrientes

---

# Roadmap Futuro

* gráficos nutricionais
* API própria
* OCR de rótulos
* recomendação alimentar por objetivo
* integração TBCA
* modo mobile app
* comparação avançada
* IA nutricional

---

# Licença

Uso educacional e experimental.

Verifique direitos e licenciamento da base TACO original.

---

# Autor

Projeto focado em transformar dados técnicos em experiência prática e visual.

---

# Resumo

De PDF técnico para sistema utilizável.

Dados melhores de usar.

```
```
