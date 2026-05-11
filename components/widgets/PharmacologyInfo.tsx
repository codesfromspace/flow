'use client';

import { useState, useEffect } from 'react';

export default function PharmacologyInfo() {
  const [expandedSections, setExpandedSections] = useState<string[]>(['overview']);
  const [selectedDrug, setSelectedDrug] = useState<'methylphenidate' | 'amphetamine' | 'caffeine'>('methylphenidate');

  useEffect(() => {
    const saved = localStorage.getItem('pharmacologyExpandedSections');
    if (saved) {
      try {
        setExpandedSections(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const next = prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id];
      localStorage.setItem('pharmacologyExpandedSections', JSON.stringify(next));
      return next;
    });
  };

  const drugInfo = {
    methylphenidate: {
      name: 'Methylfenidát (Ritalin/Concerta)',
      overview: 'Syntetický stimulant centrálního nervového systému, selektivní inhibitor zpětného vychytávání dopaminu a noradrenalinu.',
      mechanism: (
        <>
          <p>Blokuje <strong>DAT (dopaminový transportér)</strong> a <strong>NET (noradrenalinový transportér)</strong> na presynaptické membráně.</p>
          <p className="text-muted mt-2">Výsledek:</p>
          <ul className="text-muted space-y-1 ml-3">
            <li>• ↑ dopamin v prefrontálním kortexu → zvýšená pozornost, ohnisko</li>
            <li>• ↑ noradrenalin → vyšší bdělost, motivace</li>
            <li>• ↓ hyperaktivita a impulsivita</li>
          </ul>
        </>
      ),
      kinetics: (
        <>
          <div className="bg-card-border/10 p-2 rounded">
            <p className="font-medium mb-1">Okamžitý (IR):</p>
            <ul className="text-muted space-y-1 ml-3">
              <li>• <strong>Onset:</strong> 15-20 minut</li>
              <li>• <strong>Peak:</strong> 1-2 hodiny</li>
              <li>• <strong>Half-life:</strong> 3-4 hodiny</li>
              <li>• <strong>Trvání:</strong> 4-6 hodin</li>
            </ul>
          </div>
          <div className="bg-card-border/10 p-2 rounded mt-2">
            <p className="font-medium mb-1">Prodloužený (XR):</p>
            <ul className="text-muted space-y-1 ml-3">
              <li>• <strong>Onset:</strong> 30-60 minut</li>
              <li>• <strong>Peak:</strong> 3-4 hodiny</li>
              <li>• <strong>Half-life:</strong> 6-8 hodin</li>
              <li>• <strong>Trvání:</strong> 8-12 hodin</li>
            </ul>
          </div>
        </>
      )
    },
    amphetamine: {
      name: 'Amfetamin (Adderall/Elvanse)',
      overview: 'Stimulant uvolňující dopamin a noradrenalin a blokující jejich zpětné vychytávání (přes VMAT2).',
      mechanism: (
        <>
          <p>Blokuje DAT a NET a navíc <strong>obrací jejich funkci</strong> – pumpuje dopamin přímo z presynaptického neuronu do synaptické štěrbiny.</p>
          <p className="text-muted mt-2">Výsledek:</p>
          <ul className="text-muted space-y-1 ml-3">
            <li>• Masivní uvolnění dopaminu (více než u methylfenidátu)</li>
            <li>• Výrazná stimulace a bdělost</li>
          </ul>
        </>
      ),
      kinetics: (
        <div className="bg-card-border/10 p-2 rounded">
          <p className="font-medium mb-1">Amfetaminové soli:</p>
          <ul className="text-muted space-y-1 ml-3">
            <li>• <strong>Onset:</strong> 20-30 minut</li>
            <li>• <strong>Peak:</strong> 2.5 hodiny</li>
            <li>• <strong>Half-life:</strong> 10-13 hodin</li>
            <li>• <strong>Trvání:</strong> 6-8 hodin (IR)</li>
          </ul>
        </div>
      )
    },
    caffeine: {
      name: 'Kofein',
      overview: 'Přirozeně se vyskytující stimulant. Antagonista adenosinových receptorů.',
      mechanism: (
        <>
          <p>Blokuje <strong>receptory pro adenosin</strong> (molekulu, která se hromadí během bdělosti a způsobuje ospalost).</p>
          <p className="text-muted mt-2">Výsledek:</p>
          <ul className="text-muted space-y-1 ml-3">
            <li>• Mozek "nevidí" únavu, kterou reálně má</li>
            <li>• Nepřímé uvolnění malého množství dopaminu</li>
            <li>• Adrenalinová odezva (zrychlený tep)</li>
          </ul>
        </>
      ),
      kinetics: (
        <div className="bg-card-border/10 p-2 rounded">
          <p className="font-medium mb-1">Běžný Kofein:</p>
          <ul className="text-muted space-y-1 ml-3">
            <li>• <strong>Onset:</strong> 15-20 minut</li>
            <li>• <strong>Peak:</strong> 45 minut</li>
            <li>• <strong>Half-life:</strong> 5-6 hodin</li>
            <li>• <strong>Trvání:</strong> 3-5 hodin</li>
          </ul>
        </div>
      )
    }
  };

  const currentInfo = drugInfo[selectedDrug];

  const sections = [
    {
      id: 'overview',
      title: `📋 ${currentInfo.name}`,
      content: (
        <div className="space-y-3 text-xs">
          <div className="flex bg-card-border/10 rounded overflow-hidden border border-card-border/20 mb-3">
            {(['methylphenidate', 'amphetamine', 'caffeine'] as const).map(drug => (
              <button 
                key={drug} 
                onClick={() => setSelectedDrug(drug)}
                className={`flex-1 py-1.5 px-2 text-center transition ${selectedDrug === drug ? 'bg-accent-cyan text-white font-medium' : 'text-muted hover:bg-card-border/20'}`}
              >
                {drug === 'methylphenidate' ? 'MPH' : drug === 'amphetamine' ? 'AMP' : 'Kofein'}
              </button>
            ))}
          </div>
          <p><strong>Co to je:</strong> {currentInfo.overview}</p>
        </div>
      ),
    },
    {
      id: 'mechanism',
      title: '⚙️ Mechanismus účinku',
      content: (
        <div className="space-y-2 text-xs">
          {currentInfo.mechanism}
        </div>
      ),
    },
    {
      id: 'kinetics',
      title: '⏱️ Farmakokinetika',
      content: (
        <div className="space-y-3 text-xs">
          {currentInfo.kinetics}
        </div>
      ),
    },
    {
      id: 'concentration',
      title: '📊 Výpočet koncentrace',
      content: (
        <div className="space-y-2 text-xs">
          <p className="text-muted">
            <strong>Batemanův model</strong> — standardní 1-kompartmentový model pro orální absorpci:
          </p>
          <div className="bg-card-border/10 p-2 rounded font-mono text-[0.7rem] overflow-x-auto">
            <p>C(t) = (e<sup>-ke×t</sup> - e<sup>-ka×t</sup>) / normalizace</p>
          </div>
          <ul className="text-muted space-y-1 ml-3 mt-2">
            <li>• <strong>ka</strong> — absorpční konstanta (odvozena z <strong>peak time</strong>, numericky řešeno bisekčním algoritmem)</li>
            <li>• <strong>ke</strong> — eliminační konstanta = ln(2) / half-life</li>
            <li>• <strong>normalizace</strong> — zajistí, že C(Tmax) = 1 (peak = 100%)</li>
            <li>• <strong>t</strong> — čas od podání (minuty)</li>
          </ul>
          <p className="text-muted mt-2 text-[0.7rem]">
            <strong>Výhoda:</strong> Plynulá, fyzikálně přesná křivka bez arbitrárních přechodů. Kombinace absorption + eliminace se děje paralelně (ne sekvenčně).
          </p>
        </div>
      ),
    },
    {
      id: 'personalization',
      title: '👤 Individuální faktory',
      content: (
        <div className="space-y-2 text-xs">
          <p className="text-muted">
            Aplikace automaticky přizpůsobuje výpočty dle vašeho profilu:
          </p>
          <ul className="text-muted space-y-1.5 ml-3 mt-2">
            <li>
              <strong>Váha:</strong> Těžší jedinci (>70kg) mají nižší peak (více rozpuštěného léku), lehčí jedinci vyšší peak. Faktor: (70 / váha)<sup>0.35</sup>
            </li>
            <li>
              <strong>Věk:</strong> Ovlivňuje jak <strong>peak level</strong> tak <strong>half-life</strong> a tím pádem i tvar celé křivky. Starší jedinci zpravidla mají pozvolnější eliminaci.
            </li>
            <li>
              <strong>Bioavailabilita:</strong> Závisí na formě léku (tablet, kapsule, tekutina...). Ovlivňuje výšku peaku.
            </li>
          </ul>
          <p className="text-muted mt-2 text-[0.7rem]">
            💡 Pro nejpřesnější výpočet si aktualizujte svůj profil (věk, váhu) v nastavení.
          </p>
        </div>
      ),
    },
    {
      id: 'focus',
      title: '🧠 Vztah ke koncentraci',
      content: (
        <div className="space-y-2 text-xs">
          <p className="text-muted">
            Efektivita není lineární. Mozek má <strong>optimální bod</strong> - inverzní U-křivka:
          </p>
          <div className="bg-card-border/10 p-3 rounded space-y-2 my-2">
            <div className="flex items-center gap-2">
              <div className="text-xs">0% ← Nízka</div>
              <div className="flex-1 h-1 bg-gradient-to-r from-red-500 to-yellow-500" />
              <div className="text-xs">Optimum</div>
              <div className="flex-1 h-1 bg-gradient-to-r from-yellow-500 to-red-500" />
              <div className="text-xs">Vysoká →</div>
            </div>
          </div>
          <ul className="text-muted space-y-1 ml-3">
            <li>• <strong>0.00-0.18:</strong> Nízká relativní aktivace</li>
            <li>• <strong>0.18-0.55:</strong> Odhad užitečného rozsahu</li>
            <li>• <strong>0.55-1.00:</strong> Vyšší riziko přestimulace</li>
            <li>• <strong>Pozn.:</strong> Nejde o krevní koncentraci ani dávkovací doporučení.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'rebound',
      title: '📉 Rebound efekt',
      content: (
        <div className="space-y-2 text-xs">
          <p>
            Po odeznění efektu dochází k <strong>poklesu dopaminu pod baseline</strong>. Subjektivně: únava, deprese, demotivace.
          </p>
          <p className="text-muted">
            <strong>Kdy se projevuje:</strong> 4-8 hodin po podání.
          </p>
          <p className="text-muted">
            <strong>Jak zmírnit:</strong> Dostatečná hydratace, spánek, pravidelné jídlo, vyhnutí se dalším stimulantům.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      {sections.map((section) => (
        <div key={section.id} className="card-base border border-card-border/30 overflow-hidden">
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-card-border/10 transition-colors text-left"
          >
            <h4 className="text-sm font-medium text-foreground">{section.title}</h4>
            <span
              className={`text-lg transition-transform ${
                expandedSections.includes(section.id) ? 'rotate-180' : ''
              }`}
            >
              ▼
            </span>
          </button>

          {expandedSections.includes(section.id) && (
            <div className="px-4 pb-3 border-t border-card-border/20 pt-3">
              {section.content}
            </div>
          )}
        </div>
      ))}

      <div className="card-base bg-card-border/10 p-3 rounded-lg border border-card-border/30 mt-4">
        <p className="text-xs text-muted leading-relaxed">
          <strong>⚠️ Poznámka:</strong> Tato aplikace je edukativní nástroj. Není náhradou za lékařskou konzultaci. Vždy se poraďte s lékařem před změnou medikace.
        </p>
      </div>
    </div>
  );
}
