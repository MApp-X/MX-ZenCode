const iconsContainer = document.getElementById('icons');
const h = document.getElementById('h');

const iconFiles = await fetch('/api/icons').then(r=>r.json());
console.log(iconFiles);
h.innerText += `(${iconFiles.length})`;

iconFiles.forEach(file => {
    const img = document.createElement('img');
    const div = document.createElement('div');
    const p = document.createElement('p');
    img.src = `./icons/${file}`;
    p.innerHTML = file;
    div.className = "icon";
    div.appendChild(img);
    div.appendChild(p);

    iconsContainer.appendChild(div);
});