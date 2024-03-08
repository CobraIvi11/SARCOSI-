document.addEventListener("DOMContentLoaded", () => {
    const gameBoard = document.getElementById("gameBoard");

    const righe = 7;
    const colonne = 7;
    const tipi = 4;
    let mosseSenzaRisultato = 0;
    let potereDelRicicloDisponibile = 5;
    let potereDelRicicloAttivo = false;

    let griglia = [];
    let cellaSelezionata = null;
    let mossaConsentita = true;

    function inizializzaGriglia() {
        do {
            creaGriglia();
        } while (controllaCorrispondenze().length > 0);
        disegnaGriglia();
    }



    function creaGriglia() {
        for (let riga = 0; riga < righe; riga++) {
            griglia[riga] = [];
            for (let colonna = 0; colonna < colonne; colonna++) {
                let valore;
                const randomNum = Math.random() * 100;

                if (randomNum < 9) {
                    valore = 0;
                } else if (randomNum < 16) {
                    valore = 4;
                } else if (randomNum < 30) {
                    valore = 3;
                } else if (randomNum < 60) {
                    valore = 2;
                } else {
                    valore = 1;
                }




                griglia[riga][colonna] = {
                    valore: valore,
                    rimosso: false
                };
            }
        }
    }



    function disegnaGriglia() {
        gameBoard.innerHTML = "";
        for (let riga = 0; riga < righe; riga++) {
            for (let colonna = 0; colonna < colonne; colonna++) {
                const cella = document.createElement("div");
                cella.classList.add("cella", `cella-${griglia[riga][colonna].valore}`);
                cella.dataset.riga = riga;
                cella.dataset.colonna = colonna;
            
                cella.textContent = ""; 
                cella.addEventListener("click", () => gestisciClickCella(riga, colonna));
                gameBoard.appendChild(cella);
            }
        }
    }
    



    function gestisciClickCella(riga, colonna) {

        if (griglia[riga][colonna].valore === 4) return;

        if (!mossaConsentita) return;
        if (!cellaSelezionata) {
            cellaSelezionata = { riga, colonna };
            highlightSelectedCell(riga, colonna);
        } else {
            const { riga: rigaPrec, colonna: colonnaPrec } = cellaSelezionata;
            if (
                (Math.abs(riga - rigaPrec) === 1 && colonna === colonnaPrec) ||
                (Math.abs(colonna - colonnaPrec) === 1 && riga === rigaPrec)
            ) {
                if (potereDelRicicloAttivo) {
                    attivaPotereDelRiciclo(riga, colonna);
                    potereDelRicicloAttivo = false;
                } else {
                    const originalGrid = JSON.parse(JSON.stringify(griglia));
                    scambiaCelle(riga, colonna, rigaPrec, colonnaPrec);
                    const corrispondenze = controllaCorrispondenze();
                    if (corrispondenze.length === 0) {
                        setTimeout(() => {
                            griglia = originalGrid;
                            disegnaGriglia();
                            if (griglia[riga][colonna].valore !== 5) {
                                removeCellHighlight(rigaPrec, colonnaPrec);
                            }
                        }, 500);
                    }
                }
                cellaSelezionata = null;
                mossaConsentita = false;
                setTimeout(() => {
                    gestisciCorrispondenze();
                    riempiCelleVuote();
                    mossaConsentita = true;
                }, 500);
            } else {
                removeCellHighlight(rigaPrec, colonnaPrec);
                cellaSelezionata = { riga, colonna };
                highlightSelectedCell(riga, colonna);
            }
        }

        distruggiCella5EVicini(riga, colonna);
    }

    function highlightSelectedCell(riga, colonna) {
        const selectedCell = document.querySelector(`.cella[data-riga="${riga}"][data-colonna="${colonna}"]`);
        selectedCell.classList.add("cella-selezionata");
    }
    

    function removeCellHighlight(riga, colonna) {
        const cell = document.querySelector(`.cella[data-riga="${riga}"][data-colonna="${colonna}"]`);
        cell.classList.remove("cella-selezionata");
    }
    






    function scambiaCelle(riga1, colonna1, riga2, colonna2) {
        const temp = griglia[riga1][colonna1];
        griglia[riga1][colonna1] = griglia[riga2][colonna2];
        griglia[riga2][colonna2] = temp;
        disegnaGriglia();
    }




    function controllaCorrispondenze() {
        const corrispondenze = [];
        for (let riga = 0; riga < righe; riga++) {
            for (let colonna = 0; colonna < colonne; colonna++) {

                if (griglia[riga][colonna].valore !== 4) {
                    if (
                        colonna < colonne - 2 &&
                        griglia[riga][colonna].valore === griglia[riga][colonna + 1].valore &&
                        griglia[riga][colonna].valore === griglia[riga][colonna + 2].valore
                    ) {
                        corrispondenze.push(
                            { riga, colonna },
                            { riga, colonna: colonna + 1 },
                            { riga, colonna: colonna + 2 }
                        );
                    }
                    if (
                        riga < righe - 2 &&
                        griglia[riga][colonna].valore === griglia[riga + 1][colonna].valore &&
                        griglia[riga][colonna].valore === griglia[riga + 2][colonna].valore
                    ) {
                        corrispondenze.push(
                            { riga, colonna },
                            { riga: riga + 1, colonna },
                            { riga: riga + 2, colonna }
                        );
                    }
                }
            }
        }
        return corrispondenze;
    }




    let punteggioTotale = 0;




    function aggiornaPunteggioTotale(punti) {

        document.getElementById("punteggioTotale").textContent = punteggioTotale;
    }




    let punteggispazzature = [0, 0, 0, 0];
    let celleEliminatePerTipo = [0, 0, 0, 0];

    function aggiornaPunteggiospazzatura(tipospazzatura, punti) {
        let valorePunti = punti;
        if (tipospazzatura === 0) {
            valorePunti = 5;
        }
        punteggispazzature[tipospazzatura] += valorePunti;
        celleEliminatePerTipo[tipospazzatura]++;


        punteggioTotale = punteggispazzature.reduce((acc, curr) => acc + curr, 0);
        document.getElementById(`punteggioTipo${tipospazzatura}`).textContent = punteggispazzature[tipospazzatura];
        document.getElementById("punteggioTotale").textContent = punteggioTotale;


        document.getElementById(`conteggiospazzatura${tipospazzatura}`).textContent = celleEliminatePerTipo[tipospazzatura];
    }



    function gestisciCorrispondenze() {
        const corrispondenze = controllaCorrispondenze();
        if (corrispondenze.length > 0) {
            mosseSenzaRisultato = 0;
            corrispondenze.forEach(spazzatura => {
                const valorespazzatura = griglia[spazzatura.riga][spazzatura.colonna].valore;
                aggiornaPunteggiospazzatura(valorespazzatura, valorespazzatura);
            });
            rimuoviCelle(corrispondenze);
    
            const punti = corrispondenze.reduce((acc, curr) => acc + griglia[curr.riga][curr.colonna].valore, 0);
            aggiornaPunteggioTotale(punti);
    
           
            if (corrispondenze.length >= 4) {
                let maxColonna = -1;
                let maxRiga = -1;
    
                corrispondenze.forEach(cell => {
                    if (cell.colonna > maxColonna) {
                        maxColonna = cell.colonna;
                        maxRiga = cell.riga;
                    }
                });
    
              
                const cinquina = corrispondenze.length === 5;
    
                
                const L = corrispondenze.some(cell => 
                    (cell.riga === maxRiga - 1 && cell.colonna === maxColonna) ||
                    (cell.riga === maxRiga && cell.colonna === maxColonna + 1)
                );
    
                if (cinquina || L) {
                    griglia[maxRiga][maxColonna] = { valore: 6, rimosso: false }; 
                } else {
                    griglia[maxRiga][maxColonna] = { valore: 5, rimosso: false }; 
                }
            }
    
            
            disegnaGriglia();
            setTimeout(() => {
                gestisciCorrispondenze();
            }, 500);
        } else {
            mosseSenzaRisultato++;
            if (mosseSenzaRisultato === 3) {
                alert("Hai perso! Le tue mosse non portano a nessuna corrispondenza. Vuoi ricominciare?");
                inizializzaGriglia();
                mosseSenzaRisultato = 0;
                punteggioTotale = 0;
                aggiornaPunteggioTotale(punteggioTotale);
                punteggispazzature = [0, 0, 0, 0];
                celleEliminatePerTipo = [0, 0, 0, 0];
                punteggispazzature.forEach((punteggio, indice) => {
                    document.getElementById(`punteggioTipo${indice}`).textContent = punteggio;
                    document.getElementById(`conteggiospazzatura${indice}`).textContent = 0;
                });
            }
        }
    }






    



    function coloraCelle(corrispondenze) {
        let topRowEmptyCell = null;
        let topRowContainsFive = false;
    
        for (let colonna = 0; colonna < colonne; colonna++) {
            if (griglia[0][colonna].valore === 5) {
                topRowContainsFive = true;
                break;
            }
        }
    
        if (!topRowContainsFive) {
            for (let colonna = 0; colonna < colonne; colonna++) {
                if (griglia[0][colonna].valore === -1) {
                    topRowEmptyCell = { riga: 0, colonna };
                    break;
                }
            }
        }
    
        if (topRowEmptyCell !== null) {
            griglia[topRowEmptyCell.riga][topRowEmptyCell.colonna].valore = 5;
            disegnaGriglia();
            return;
        }
    
        corrispondenze.forEach(({ riga, colonna }) => {
            const cella = document.querySelector(`.cella[data-riga="${riga}"][data-colonna="${colonna}"]`);
            cella.style.backgroundColor = "lightgray";
    
            
            if (griglia[riga][colonna].valore === 5) {
                cella.style.backgroundColor = "lightblue";
            }
        });
    }
    





    function rimuoviCelle(corrispondenze) {
        corrispondenze.forEach(({ riga, colonna }) => {
            griglia[riga][colonna].valore = -1;
        });
        disegnaGriglia();
    }





    function riempiCelleVuote() {
        let celleVuoteEsistono = false;
        for (let colonna = 0; colonna < colonne; colonna++) {
            for (let riga = righe - 1; riga >= 0; riga--) {
                if (griglia[riga][colonna].valore === -1) {
                    celleVuoteEsistono = true;
                    for (let i = riga; i >= 0; i--) {
                        if (i === 0) {
                            const valore = Math.random() < 0.07 ? 4 : Math.floor(Math.random() * tipi);
                            griglia[i][colonna].valore = valore;
                        } else {
                            griglia[i][colonna].valore = griglia[i - 1][colonna].valore;
                        }
                    }
                }
            }
        }
        if (celleVuoteEsistono) {
            setTimeout(() => {
                disegnaGriglia();
                riempiCelleVuote();
            }, 500);
        }
    }





    function attivaPotereDelRiciclo(riga, colonna) {
        if (potereDelRicicloDisponibile > 0) {
            rimuoviCelle([
                { riga: riga, colonna: colonna },
                { riga: riga - 1, colonna: colonna },
                { riga: riga + 1, colonna: colonna },
                { riga: riga, colonna: colonna - 1 },
                { riga: riga, colonna: colonna + 1 }
            ]);
            potereDelRicicloDisponibile--;
            console.log("Potere del riciclo utilizzato. Utilizzi rimanenti:", potereDelRicicloDisponibile);
        } else {
            console.log("Hai esaurito i utilizzi del potere del riciclo.");

        }
    }




    function distruggiCella5EVicini(riga, colonna) {
        if (griglia[riga][colonna].valore === 5) {
            let cellsToDestroy = [
                { riga, colonna },
                { riga: riga - 1, colonna },
                { riga: riga + 1, colonna },
                { riga, colonna: colonna - 1 },
                { riga, colonna: colonna + 1 }
            ];
    
      
            cellsToDestroy.sort((a, b) => b.colonna - a.colonna);
    
            let punti = 0;
    
            cellsToDestroy.forEach(({ riga, colonna }) => {
                if (riga >= 0 && riga < righe && colonna >= 0 && colonna < colonne) {
                    const valore = griglia[riga][colonna].valore;
                    if (valore !== -1 && valore !== 4) {
                        if (valore !== 5) {
                            aggiornaPunteggiospazzatura(valore, valore);
                            punti += valore;
                        }
                    }
                }
            });
    
            punti += cellsToDestroy.length - 1;
            aggiornaPunteggioTotale(punti);
    
            cellsToDestroy.forEach(({ riga, colonna }) => {
                if (riga >= 0 && riga < righe && colonna >= 0 && colonna < colonne) {
                    if (griglia[riga][colonna].valore !== 4) {
                        griglia[riga][colonna].valore = -1;
                    }
                }
            });
    
            disegnaGriglia();
    
            setTimeout(() => {
                riempiCelleVuote();
            }, 500);
        }
    }
    





    inizializzaGriglia();
});
