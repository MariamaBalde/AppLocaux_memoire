import SearchBar from './SearchBar';
import FilterSidebar from './FilterSidebar';

export default function ProductFilters(props) {
  const {
    searchValue,
    onSearchChange,
    onSearchSubmit,
    ...sidebarProps
  } = props;

  return (
    <div className="space-y-3">
      <SearchBar value={searchValue} onChange={onSearchChange} onSubmit={onSearchSubmit} />
      <FilterSidebar {...sidebarProps} />
    </div>
  );
}
