# Charts Integration Documentation

## Overview

The Personal Finance Manager includes comprehensive data visualization using **Recharts**, a composable charting library for React. Three different chart types are implemented to provide multiple perspectives on financial data.

## 📊 Chart Types Implemented

### 1. **Pie Chart - Category-wise Expenses**
**Purpose**: Visualize spending distribution across different expense categories

**Location**: Dashboard -> Charts Section (Top Left)

**Features**:
- Shows expense amount per category
- Displays percentage distribution
- Interactive labels
- Color-coded categories
- Hover tooltips with values

**Data Source**: `categoryBreakdown` (calculated from transactions)

**API Endpoint**: `/api/transactions/analytics/category-breakdown`

**Example Data**:
```json
[
  { "name": "Food", "value": 450.50 },
  { "name": "Transport", "value": 200.00 },
  { "name": "Entertainment", "value": 150.75 },
  { "name": "Bills", "value": 800.00 }
]
```

**Code Implementation**:
```jsx
<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie
      data={pieChartData}
      cx="50%"
      cy="50%"
      labelLine={false}
      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
      outerRadius={80}
      fill="#8884d8"
      dataKey="value"
    >
      {pieChartData.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
    <Legend />
  </PieChart>
</ResponsiveContainer>
```

---

### 2. **Bar Chart - Income vs Expenses**
**Purpose**: Compare total income against total expenses at a glance

**Location**: Dashboard -> Charts Section (Top Right)

**Features**:
- Side-by-side comparison
- Color-coded bars (Green for income, Red for expenses)
- Y-axis shows amounts in dollars
- Formatted currency display in tooltips
- Legend for clarity

**Data Source**: `totalIncome` and `totalExpense` (calculated from transactions)

**Example Data**:
```json
[
  { "name": "Income", "amount": 5000, "fill": "#10b981" },
  { "name": "Expenses", "amount": 2150.25, "fill": "#ef4444" }
]
```

**Code Implementation**:
```jsx
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={barChartData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
    <Legend />
    <Bar dataKey="amount" fill="#8884d8">
      {barChartData.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={entry.fill} />
      ))}
    </Bar>
  </BarChart>
</ResponsiveContainer>
```

---

### 3. **Line Chart - Monthly Income vs Expenses** (NEW)
**Purpose**: Track income and expense trends over time (monthly view)

**Location**: Dashboard -> Charts Section (Bottom, Full Width)

**Features**:
- Two lines: Income (green) and Expenses (red)
- Monthly data points
- Interactive dots on each data point
- Angled X-axis labels for readability
- Trend visualization for budget planning
- Formatted currency in tooltips

**Data Source**: `monthlyTrendData` (fetched from backend)

**API Endpoint**: `/api/transactions/analytics/monthly-trend`

**Example Data**:
```json
[
  { "month": "January", "income": 5000, "expense": 2000 },
  { "month": "February", "income": 5200, "expense": 2150 },
  { "month": "March", "income": 4800, "expense": 2300 },
  { "month": "April", "income": 5500, "expense": 1800 }
]
```

**Code Implementation**:
```jsx
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={monthlyTrendData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis 
      dataKey="month" 
      angle={-45}
      textAnchor="end"
      height={80}
    />
    <YAxis />
    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
    <Legend />
    <Line 
      type="monotone" 
      dataKey="income" 
      stroke="#10b981" 
      strokeWidth={2}
      name="Income"
      dot={{ fill: '#10b981', r: 4 }}
    />
    <Line 
      type="monotone" 
      dataKey="expense" 
      stroke="#ef4444" 
      strokeWidth={2}
      name="Expenses"
      dot={{ fill: '#ef4444', r: 4 }}
    />
  </LineChart>
</ResponsiveContainer>
```

---

## 🎨 Color Scheme

### Chart Colors
```javascript
const COLORS = [
  '#3b82f6',  // Blue
  '#10b981',  // Green
  '#f59e0b',  // Amber
  '#ef4444',  // Red
  '#8b5cf6',  // Purple
  '#ec4899',  // Pink
  '#06b6d4',  // Cyan
  '#6366f1',  // Indigo
];
```

### Status Colors
- **Income**: `#10b981` (Green)
- **Expenses**: `#ef4444` (Red)
- **Default**: `#8884d8` (Blue)

---

## 📦 Dependencies

The charts are built with **Recharts**, which is already included in `package.json`:

```json
"dependencies": {
  "recharts": "^3.7.0"
}
```

### Recharts Components Used
- `ResponsiveContainer` - Responsive wrapper
- `PieChart`, `Pie`, `Cell` - Pie charts
- `BarChart`, `Bar` - Bar charts
- `LineChart`, `Line` - Line charts
- `XAxis`, `YAxis` - Axes
- `CartesianGrid` - Grid lines
- `Tooltip` - Hover tooltips
- `Legend` - Chart legend

---

## 🔧 Implementation Details

### Dashboard Component
**File**: `src/components/pages/Dashboard.jsx`

**Key Functions**:
```javascript
// Pie chart data processing
const pieChartData = useMemo(() => {
  return Object.entries(categoryBreakdown)
    .map(([category, amount]) => ({
      name: category,
      value: amount
    }))
    .sort((a, b) => b.value - a.value);
}, [categoryBreakdown]);

// Bar chart data
const barChartData = useMemo(() => {
  return [
    { name: 'Income', amount: totalIncome, fill: '#10b981' },
    { name: 'Expenses', amount: totalExpense, fill: '#ef4444' }
  ];
}, [totalIncome, totalExpense]);

// Monthly trend data
const [monthlyTrendData, setMonthlyTrendData] = useState([]);

useEffect(() => {
  const fetchMonthlyTrend = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const response = await api.getMonthlyTrend(currentYear);
      setMonthlyTrendData(response.data || []);
    } catch (err) {
      console.error('Error fetching monthly trend:', err);
    }
  };
  fetchMonthlyTrend();
}, []);
```

### API Integration
**File**: `src/services/api.js`

**Endpoints Used**:
```javascript
// Get category breakdown (for Pie Chart)
export const getCategoryBreakdown = async (startDate = null, endDate = null) => {
  // ...
};

// Get monthly trends (for Line Chart)
export const getMonthlyTrend = async (year = null) => {
  const response = await api.get(`/transactions/analytics/monthly-trend?year=${year}`);
  return response.data;
};
```

---

## 📱 Responsive Design

All charts are wrapped in `ResponsiveContainer` which:
- Automatically adjusts to parent container width
- Maintains aspect ratio
- Handles mobile screen sizes
- Updates on window resize

**CSS Classes** (from `Dashboard.css`):
```css
.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.chart-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-title {
  color: #333;
  font-size: 16px;
  margin-bottom: 15px;
  font-weight: 600;
}
```

---

## 🔄 Data Flow

```
1. Dashboard Component Mounts
   ↓
2. fetchTransactions() - Get all user transactions
   ↓
3. Calculate Summaries:
   - categoryBreakdown (for Pie Chart)
   - totalIncome, totalExpense (for Bar Chart)
   ↓
4. fetchMonthlyTrend() - Get monthly data
   ↓
5. Render Charts:
   - PieChart (category breakdown)
   - BarChart (income vs expense)
   - LineChart (monthly trends)
```

---

## 📈 Use Cases

### Pie Chart
- Understanding spending patterns
- Identifying which categories consume most budget
- Planning budget allocation

### Bar Chart
- Quick overview of financial health
- Comparing income against expenses
- Determining if spending is within budget

### Line Chart
- Track financial trends over time
- Identify seasonal spending patterns
- Plan future budgets based on trends
- Monitor income stability

---

## ⚙️ Customization

### Change Chart Heights
```jsx
<ResponsiveContainer width="100%" height={400}>  {/* Change 300 to 400 */}
  {/* Chart */}
</ResponsiveContainer>
```

### Change Bar Colors
```javascript
const barChartData = [
  { name: 'Income', amount: totalIncome, fill: '#3b82f6' },  // Change color
  { name: 'Expenses', amount: totalExpense, fill: '#f87171' }
];
```

### Add More Categories to Colors
```javascript
const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1',
  '#14b8a6', '#f43f5e'  // Add more colors
];
```

### Change Line Chart Styling
```jsx
<Line 
  type="monotone" 
  dataKey="income" 
  stroke="#10b981" 
  strokeWidth={3}        // Make line thicker
  name="Income"
  dot={{ fill: '#10b981', r: 6 }}  // Larger dots
  activeDot={{ r: 8 }}   // Interactive dots
/>
```

---

## 🐛 Troubleshooting

### Chart Not Displaying
1. Check if data is being fetched (DevTools -> Network)
2. Verify API endpoints are working
3. Check console for errors
4. Ensure ResponsiveContainer has parent with height

### Data Not Updating
1. Check if state is being set correctly
2. Verify useMemo dependencies
3. Check if API response format matches expected data

### Charts Look Weird on Mobile
1. Adjust grid layout in CSS
2. Reduce chart heights for smaller screens
3. Consider using `grid-template-columns: 1fr` for mobile

---

## 🚀 Future Enhancements

- [ ] Stacked bar charts for income/expense breakdown per month
- [ ] Year-over-year comparison charts
- [ ] Custom date range for charts
- [ ] Export charts as images
- [ ] Interactive drill-down from charts
- [ ] Animated chart transitions
- [ ] More chart types (area, scatter, radar)
- [ ] Real-time chart updates

---

## 📚 References

- [Recharts Documentation](https://recharts.org/)
- [React Hooks - useMemo](https://react.dev/reference/react/useMemo)
- [Responsive Design Patterns](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)

---

For questions or issues, refer to the main [README.md](../README.md) or [API_DOCUMENTATION.md](../backend/API_DOCUMENTATION.md).
