# QuantumDeploy — Entorno y Flujo de Trabajo

Fork de [Dokploy](https://github.com/Dokploy/dokploy) para uso propio (ArisnetX Solutions LLC).

## Arquitectura del entorno

```
GitHub: ArisnetX-Solutions-LLC/QDokploy
├── main   (default) ← aquí se desarrolla
└── canary           ← espejo puro de Dokploy

Windows: D:\PROJECT_ARISNETX\QDokploy\QuantumDeploy
├── origin   → git@github-personal:ArisnetX-Solutions-LLC/QDokploy.git
├── upstream → https://github.com/Dokploy/dokploy.git
└── Aquí se edita el código (VS Code, etc.)

WSL2: Ubuntu 24.04 · /root/QuantumDeploy
├── origin   → git@github-personal:ArisnetX-Solutions-LLC/QDokploy.git  (sin llave SSH aún)
├── espejo   → /mnt/d/PROJECT_ARISNETX/QDokploy/QuantumDeploy           (sync local sin credenciales)
├── upstream → https://github.com/Dokploy/dokploy.git
├── qd-dev.service (systemd) — dev server en http://localhost:3000
├── Docker 29.x + Swarm activo
├── Traefik v3.6 + Postgres 16 (contenedores)
└── Aquí se prueba el código
```

## Estrategia de ramas

| Rama       | Propósito         | Regla                                |
| ---------- | ------------------ | ------------------------------------ |
| `canary` | Desarrollo directo | Commits rápidos y experimentos      |
| `main`   | Línea estable     | Se actualiza vía PR desde`canary` |

## Flujo diario

### 1. Editar y subir (Windows)

```bash
cd D:\PROJECT_ARISNETX\QDokploy\QuantumDeploy
git checkout canary
# ... editar código ...
git add -A && git commit -m "feat: mi cambio"
git push                # → GitHub origin/canary
```

Opcional: abrir PR `canary → main` en GitHub para integrar a la línea estable.

```powershell
gh pr create --base main --head canary
gh pr merge --merge
```

### 2. Probar (WSL)

```bash
wsl -d Ubuntu-24.04 -u root
cd /root/QuantumDeploy
git pull espejo canary          # sincroniza desde la copia Windows
systemctl restart qd-dev        # aplica cambios del server (tsx watch reinicia solo la UI)
```

Abrir http://localhost:3000

> El hot-reload de Next.js detecta cambios de UI automáticamente; `restart qd-dev`
> es para cambios en `packages/server` o configuración.

## Sincronizar actualizaciones de Dokploy

```bash
# En Windows
git checkout canary
git pull origin canary          # asegurar rama al día
git merge upstream/canary       # traer novedades de Dokploy
# resolver conflictos si los hay
git push

# probar en WSL antes de integrar a main
```

En WSL después de una actualización grande:

```bash
pnpm install                    # si cambiaron dependencias
pnpm run migration:run          # si hay migraciones nuevas (desde apps/dokploy)
```

## Comandos útiles (WSL)

```bash
# Estado del dev server
wsl -d Ubuntu-24.04 -u root -- systemctl status qd-dev

# Logs en vivo
wsl -d Ubuntu-24.04 -u root -- tail -f /root/qd-dev.log

# Reiniciar dev server
wsl -d Ubuntu-24.04 -u root -- systemctl restart qd-dev

# Estado de Docker / contenedores
wsl -d Ubuntu-24.04 -u root -- docker ps

# Consola interactiva
wsl -d Ubuntu-24.04 -u root
```

## Recuperación del entorno

El servicio `qd-dev.service` está habilitado en systemd: **cada vez que WSL arranque,
el dev server levanta solo**. Si algo se rompe:

```bash
# Dev server no responde
wsl -d Ubuntu-24.04 -u root -- systemctl restart qd-dev

# Docker no arranca contenedores
wsl -d Ubuntu-24.04 -u root -- systemctl restart docker

# Reinstalar dependencias (tras cambiar de rama con deps nuevas)
wsl -d Ubuntu-24.04 -u root -- bash -c "cd /root/QuantumDeploy && pnpm install"
```

## Licencias (recordatorio)

| Código           | Licencia                                 | Ubicación                                                                                                                             |
| ----------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Core completo     | Apache 2.0 — modificable libremente     | todo el repo excepto`/proprietary`                                                                                                   |
| Funciones premium | Dokploy DSAL —**no redistribuir** | `apps/dokploy/components/proprietary`, `apps/dokploy/server/api/routers/proprietary`, `packages/server/src/services/proprietary` |

Uso interno propio: permitido modificar todo. No publicar el fork con el código DSAL intacto.
