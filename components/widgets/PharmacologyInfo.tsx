'use client';

import { useState } from 'react';

export default function PharmacologyInfo() {
  const [expandedSection, setExpandedSection] = useState<string | null>('overview');

  const sections = [
    {
      id: 'overview',
      title: '📋 Methylfenidat (Ritalín)',
      content: (
        <div className="space-y-2 text-xs">
          <p>
            <strong>Co to je:</strong> Syntetický stimulant centrálního nervového systému, selektivní inhibitor zpětného vychytávání dopaminu a noradrenalinu.
          </p>
          <p>
            <strong>Medicínské použití:</strong> ADHD, narkolepsie, hypersomnie.
          </p>
        </div>
      ),
    },
    {
      id: 'mechanism',
      title: '⚙️ Mechanismus účinku',
      content: (
        <div className="space-y-2 text-xs">
          <p>
            Methylfenidat blokuje <strong>DAT (dopaminový transportér)</strong> a <strong>NET (noradrenalinový transportér)</strong> na presynaptické membráně.
          </p>
          <p className="text-muted">Výsledek:</p>
          <ul className="text-muted space-y-1 ml-3">
            <li>• ↑ dopamin v prefrontálním kortexu → zvýšená pozornost, ohnisko</li>
            <li>• ↑ noradrenalin → vyšší bdělost, motivace</li>
            <li>• ↓ hyperaktivita a impulsivita</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'kinetics',
      title: '⏱️ Farmakokinetika',
      content: (
        <div className="space-y-3 text-xs">
          <div className="bg-card-border/10 p-2 rounded">
            <p className="font-medium mb-1">Okamžitý Ritalín (IR):</p>
            <ul className="text-muted space-y-1 ml-3">
              <li>• <strong>Onset:</strong> 15-20 minut</li>
              <li>• <strong>Peak:</strong> 1-2 hodiny</li>
              <li>• <strong>Half-life:</strong> 3-4 hodiny</li>
              <li>• <strong>Trvání:</strong> 4-6 hodin</li>
            </ul>
          </div>
          <div className="bg-card-border/10 p-2 rounded">
            <p className="font-medium mb-1">Prodloužený Concerta (XR):</p>
            <ul className="text-muted space-y-1 ml-3">
              <li>• <strong>Onset:</strong> 30-60 minut</li>
              <li>• <strong>Peak:</strong> 3-4 hodiny</li>
              <li>• <strong>Half-life:</strong> 6-8 hodin</li>
              <li>• <strong>Trvání:</strong> 8-12 hodin</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'concentration',
      title: '📊 Výpočet koncentrace',
      content: (
        <div className="space-y-2 text-xs">
          <p className="text-muted">
            Aplikujeme <strong>model absorpce a eliminace</strong>:
          </p>
          <div className="bg-card-border/10 p-2 rounded font-mono text-[0.7rem] overflow-x-auto">
            <p>C(t) = (D × ka × ke) / (V × (ka - ke))</p>
            <p className="mt-1 text-muted text-[0.65rem]">× (e<sup>-ke×t</sup> - e<sup>-ka×t</sup>)</p>
          </div>
          <ul className="text-muted space-y-1 ml-3 mt-2">
            <li>• <strong>D</strong> = dávka (mg)</li>
            <li>• <strong>ka</strong> = absorpční konstanta (10% za minutu pro IR)</li>
            <li>• <strong>ke</strong> = eliminační konstanta (ln2 / half-life)</li>
            <li>• <strong>V</strong> = objem distribuce</li>
            <li>• <strong>t</strong> = čas od podání (minuty)</li>
          </ul>
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
            onClick={() =>
              setExpandedSection(
                expandedSection === section.id ? null : section.id
              )
            }
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-card-border/10 transition-colors text-left"
          >
            <h4 className="text-sm font-medium text-foreground">{section.title}</h4>
            <span
              className={`text-lg transition-transform ${
                expandedSection === section.id ? 'rotate-180' : ''
              }`}
            >
              ▼
            </span>
          </button>

          {expandedSection === section.id && (
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
