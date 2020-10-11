# Shooting Circle Game

## Window object
- no need for using window.prop
- e.g. we can use `canvas.height = innerHeight;`
  
## Animation
  - `requestAnimationFrame()`
  - return value to show what is currently animation frame
  - `const animationId = requestAnimationFrame(func)`
  - `cancelAnimationFrame(animationId)`

## Math
> Math.atan2(y, x)
- returns the angle in the plane (in radians [-pi, pi]) between the positive x-axis and the ray from (0, 0) to the point (x, y), for Math.atan2(y, x)
- pi ----------------- 0 (pi = 3.14, pi = 180deg)
> Math.hipot(v1, v2, ... , vn)
- returns the square root of the sum of squares of its arguments

## get enemy position
- `const x = Math.random() &lt; 0.5 ? 0 - radius : canvas.width + radius`
  
## animation library
- gsap -> greensock
- gsap cloudflare
- `gsap.to(enemy, { radius: enemy.radius * 0.6})

## Array method
- array.splice(startIndex, numberToRemove);
- array.splice(2, 1); => remove index 2
- array.splice(2, 2); => remove index 2 and index 3

## Canvas
  - `ctx.fillStyle(0, 0, 0, 0.1)`
  - `ctx.fillRect(0, 0, width, height)`
  - `ctx.save()`
  - `ctx.globlaAlpha()`
  - `ctx.restore()`
  - [Understanding save() and restor() for canvas context](https://html5.litten.com/understanding-save-and-restore-for-the-canvas-context/)