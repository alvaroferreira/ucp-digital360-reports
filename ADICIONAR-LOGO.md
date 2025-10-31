# Como Adicionar o Logo da UCP

## Passo 1: Preparar a Imagem

Guarda a imagem do logo da UCP com um destes nomes:
- `ucp-logo.png`
- `ucp-logo.svg`
- `ucp-logo.jpg`

## Passo 2: Colocar no Projeto

Copia a imagem para a pasta `public/` do projeto:
```
/Users/alvaroferreira/Documents/= Projectos/UCP/ucp-digital360-reports/public/
```

## Passo 3: Atualizar o Código

Edita o ficheiro `app/dashboard/page.tsx` e substitui esta secção:

```tsx
<div className="w-32 h-32 bg-gray-100 rounded flex items-center justify-center border-2 border-gray-300">
  <span className="text-xs text-gray-500 text-center px-2">Logo UCP<br/>(adicionar<br/>imagem)</span>
</div>
```

Por esta (se usares PNG):

```tsx
<img
  src="/ucp-logo.png"
  alt="UCP Logo"
  className="w-32 h-auto"
/>
```

Ou esta (se usares SVG):

```tsx
<img
  src="/ucp-logo.svg"
  alt="UCP Logo"
  className="w-32 h-auto"
/>
```

## Alternativa Rápida

Podes simplesmente:
1. Arrastar a imagem do logo para a pasta `public/`
2. Recarregar a página

O logo vai aparecer automaticamente se seguires o nome correto!
