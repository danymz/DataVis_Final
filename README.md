# Interactive Household Prices Visualization

An interactive visualization of household item prices over time, with presidential term annotations. Built with Chart.js and modern web technologies.

## Features

- Multi-series line chart showing prices of common household items
- Interactive tooltips showing year and price information
- Clickable legend to toggle item visibility
- Zoom and pan capabilities
- Presidential term annotations with alternating background colors
- Responsive design that works on all screen sizes
- Accessible with proper ARIA labels and semantic HTML

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd household-prices-visualization
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
project-root/
├── public/
│   └── data/
│       └── *.xlsx         # Excel files with price data
├── src/
│   ├── charts/
│   │   └── priceChart.js  # Chart.js configuration
│   ├── utils/
│   │   ├── dataParser.js  # Legacy data processing utilities
│   │   └── excelParser.js # Excel file processing utilities
│   ├── styles/
│   │   └── main.css       # Styles and CSS variables
│   └── main.js            # Application entry point
├── index.html
├── package.json
└── README.md
```

## Data Format

The visualization uses Excel files with price data for various household items. Each Excel file contains:
- Year data
- Price data for a specific item

The application automatically:
- Extracts the item name from the filename
- Combines data from all Excel files
- Adds presidency information based on the year

## Customization

### Colors and Styling

The visualization uses CSS custom properties for theming. You can modify the colors and spacing in `src/styles/main.css`:

```css
:root {
    --color-primary: #2196f3;
    --color-secondary: #ff9800;
    /* ... other variables ... */
}
```

### Chart Configuration

Chart options can be modified in `src/charts/priceChart.js`. This includes:
- Chart type and appearance
- Axis configuration
- Tooltip behavior
- Zoom and pan settings
- Annotation styling

### Adding More Data

To add more items to the visualization:
1. Add the Excel file to the `public/data` directory
2. Update the `excelFiles` array in `src/main.js` to include the new file

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 