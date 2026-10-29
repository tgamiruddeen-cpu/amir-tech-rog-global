# Design QA — car air-conditioning diagnostic flow

## Scope

Reviewed the progressive diagnostic flow added to `index.html`, `aircond-scan.css`, and `aircond-scan.js` against the selected wireframe direction (`outputs/aircond-flow-wireframe/01-simptom.png` and `04-hasil.png`). The flow reuses the existing diagnosis function and keeps advanced inputs and the technical report available.

## Manual review

- Desktop: reviewed the local site in Chrome at approximately 960 × 1032 CSS pixels. Confirmed the hero call to action, symptom selection, progress indicator, step navigation, vehicle details, result presentation, optional full report, and WhatsApp preview.
- Tablet and narrow layouts: reviewed responsive states at approximately 768, 640, and 480 CSS pixels (using browser zoom as a viewport approximation). Cards and vehicle fields collapse to one column; primary actions remain prominent and no horizontal overflow was visible in the inspected states.
- Interaction: completed a sample path for “Panas bila berhenti” with Perodua Myvi, 2018. The result presents possible causes and suggested checks without claiming a definitive diagnosis. The WhatsApp message is shown for review and requires an explicit user click before opening WhatsApp.
- State and accessibility: checked step changes, return-to-input behavior, disclosure of technical details, and the visible floating WhatsApp control outside the scanner. Reduced-motion styling is included.

## Limitations

Responsive widths are approximate because they were reviewed by changing browser zoom, not with device emulation. This review covers visible flow states and a single sample diagnosis; it does not verify diagnosis accuracy across all vehicle/symptom combinations or test WhatsApp delivery.

## Result

**Result: passed**
