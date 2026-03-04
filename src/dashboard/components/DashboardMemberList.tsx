import { Link } from '@tanstack/react-router';
import { ArrowUpDown, Filter, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { css } from '../../../styled-system/css';
import PersonCard from '../../members/components/PersonCard';
import type { Person } from '../../types';

export default function DashboardMemberList({ initialPersons }: { initialPersons: Person[] }) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('birth_asc');
  const [filterOption, setFilterOption] = useState('all');

  const filteredPersons = initialPersons.filter((person) => {
    const matchesSearch = person.fullName.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesFilter = true;
    switch (filterOption) {
      case 'male':
        matchesFilter = person.gender === 'male';
        break;
      case 'female':
        matchesFilter = person.gender === 'female';
        break;
      case 'in_law_female':
        matchesFilter = person.gender === 'female' && person.isInLaw;
        break;
      case 'in_law_male':
        matchesFilter = person.gender === 'male' && person.isInLaw;
        break;
      case 'deceased':
        matchesFilter = person.isDeceased;
        break;
      case 'first_child':
        matchesFilter = person.birthOrder === 1;
        break;
      default:
        matchesFilter = true;
        break;
    }

    return matchesSearch && matchesFilter;
  });

  const sortedPersons = [...filteredPersons].sort((a, b) => {
    switch (sortOption) {
      case 'birth_asc':
        return (a.birthYear || 9999) - (b.birthYear || 9999);
      case 'birth_desc':
        return (b.birthYear || 0) - (a.birthYear || 0);
      case 'name_asc':
        return a.fullName.localeCompare(b.fullName, 'vi');
      case 'name_desc':
        return b.fullName.localeCompare(a.fullName, 'vi');
      default:
        return 0;
    }
  });

  return (
    <>
      <div className={css({ marginBottom: '8', position: 'relative' })}>
        <div
          className={css({
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'start',
            gap: '4',
            backgroundColor: 'rgb(255 255 255 / 0.6)',
            backdropFilter: 'blur(24px)',
            padding: '4',
            borderRadius: '2xl',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'rgb(228 228 231 / 0.6)',
            boxShadow: 'sm',
            transition: 'all 0.3s',
            position: 'relative',
            zIndex: '10',
            width: '100%',
            sm: { flexDirection: 'row', alignItems: 'center', padding: '5' },
          })}
        >
          <div className={css({ display: 'flex', flexDirection: 'column', gap: '4', width: '100%', sm: { flexDirection: 'row' }, flex: '1' })}>
            <div className={css({ position: 'relative', flex: '1', maxWidth: 'sm' })}>
              <Search
                className={css({
                  position: 'absolute',
                  left: '3.5',
                  top: '1/2',
                  transform: 'translateY(-50%)',
                  width: '4',
                  height: '4',
                  color: 'stone.400',
                  transition: 'colors 0.2s',
                  _groupFocusWithin: { color: 'amber.500' },
                })}
              />
              <input
                type="text"
                placeholder={t('member.searchPlaceholder')}
                className={css({
                  backgroundColor: 'rgb(255 255 255 / 0.9)',
                  color: 'stone.900',
                  width: '100%',
                  paddingLeft: '10',
                  paddingRight: '4',
                  paddingY: '2.5',
                  borderRadius: 'xl',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'rgb(228 228 231 / 0.8)',
                  boxShadow: 'sm',
                  outline: 'none',
                  transition: 'all 0.2s',
                  '&::placeholder': { color: 'stone.400' },
                  _focus: { borderColor: 'amber.400', boxShadow: '0 0 0 2px rgb(245 158 11 / 0.2)' },
                })}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div
              className={css({
                display: 'flex',
                flexDirection: 'column',
                gap: '2',
                width: '100%',
                alignItems: 'center',
                sm: { flexDirection: 'row', gap: '3', width: 'auto' },
              })}
            >
              <div className={css({ position: 'relative', width: '100%', sm: { width: 'auto' } })}>
                <Filter
                  className={css({
                    position: 'absolute',
                    left: '3',
                    top: '1/2',
                    transform: 'translateY(-50%)',
                    width: '4',
                    height: '4',
                    color: 'stone.400',
                    pointerEvents: 'none',
                  })}
                />
                <select
                  className={css({
                    appearance: 'none',
                    backgroundColor: 'rgb(255 255 255 / 0.9)',
                    color: 'stone.700',
                    width: '100%',
                    paddingLeft: '9',
                    paddingRight: '8',
                    paddingY: '2.5',
                    borderRadius: 'xl',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'rgb(228 228 231 / 0.8)',
                    boxShadow: 'sm',
                    fontWeight: 'medium',
                    fontSize: 'sm',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    sm: { width: '40' },
                    _focus: { borderColor: 'amber.400', boxShadow: '0 0 0 2px rgb(245 158 11 / 0.2)', backgroundColor: 'white' },
                    _hover: { borderColor: 'amber.300' },
                  })}
                  value={filterOption}
                  onChange={(e) => setFilterOption(e.target.value)}
                >
                  <option value="all">{t('member.filterAll')}</option>
                  <option value="male">{t('common.male')}</option>
                  <option value="female">{t('common.female')}</option>
                  <option value="in_law_female">{t('member.filterInLawFemale')}</option>
                  <option value="in_law_male">{t('member.filterInLawMale')}</option>
                  <option value="deceased">{t('member.filterDeceased')}</option>
                  <option value="first_child">{t('member.filterFirstborn')}</option>
                </select>
                <div
                  className={css({
                    position: 'absolute',
                    insetY: '0',
                    right: '0',
                    display: 'flex',
                    alignItems: 'center',
                    paddingX: '2',
                    pointerEvents: 'none',
                  })}
                >
                  <svg
                    className={css({ width: '4', height: '4', color: 'stone.400' })}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    role="img"
                    aria-label={t('member.openMenu')}
                  >
                    <title>{t('member.openMenu')}</title>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div className={css({ position: 'relative', width: '100%', sm: { width: 'auto' } })}>
                <ArrowUpDown
                  className={css({
                    position: 'absolute',
                    left: '3',
                    top: '1/2',
                    transform: 'translateY(-50%)',
                    width: '4',
                    height: '4',
                    color: 'stone.400',
                    pointerEvents: 'none',
                  })}
                />
                <select
                  className={css({
                    appearance: 'none',
                    backgroundColor: 'rgb(255 255 255 / 0.9)',
                    color: 'stone.700',
                    width: '100%',
                    paddingLeft: '9',
                    paddingRight: '8',
                    paddingY: '2.5',
                    borderRadius: 'xl',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'rgb(228 228 231 / 0.8)',
                    boxShadow: 'sm',
                    fontWeight: 'medium',
                    fontSize: 'sm',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    sm: { width: '52' },
                    _focus: { borderColor: 'amber.400', boxShadow: '0 0 0 2px rgb(245 158 11 / 0.2)', backgroundColor: 'white' },
                    _hover: { borderColor: 'amber.300' },
                  })}
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="birth_asc">{t('member.sortBirthAsc')}</option>
                  <option value="birth_desc">{t('member.sortBirthDesc')}</option>
                  <option value="name_asc">{t('member.sortNameAsc')}</option>
                  <option value="name_desc">{t('member.sortNameDesc')}</option>
                </select>
                <div
                  className={css({
                    position: 'absolute',
                    insetY: '0',
                    right: '0',
                    display: 'flex',
                    alignItems: 'center',
                    paddingX: '2',
                    pointerEvents: 'none',
                  })}
                >
                  <svg
                    className={css({ width: '4', height: '4', color: 'stone.400' })}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    role="img"
                    aria-label={t('member.openMenu')}
                  >
                    <title>{t('member.openMenu')}</title>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <Link
            to="/dashboard/members/new"
            className={css({
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2',
              paddingX: '4',
              paddingY: '2',
              fontWeight: 'semibold',
              fontSize: 'sm',
              borderRadius: 'lg',
              transition: 'colors 0.2s',
              backgroundColor: 'amber.600',
              color: 'white',
              _hover: { backgroundColor: 'amber.700' },
            })}
          >
            <Plus className={css({ width: '4', height: '4' })} strokeWidth={2.5} />
            {t('member.addMember')}
          </Link>
        </div>
      </div>

      {sortedPersons.length > 0 ? (
        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '6',
            sm: { gridTemplateColumns: 'repeat(2, 1fr)' },
            lg: { gridTemplateColumns: 'repeat(3, 1fr)' },
          })}
        >
          {sortedPersons.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      ) : (
        <div className={css({ textAlign: 'center', paddingY: '12', color: 'stone.400', fontStyle: 'italic' })}>
          {initialPersons.length > 0 ? t('member.noResults') : t('member.emptyState')}
        </div>
      )}
    </>
  );
}
