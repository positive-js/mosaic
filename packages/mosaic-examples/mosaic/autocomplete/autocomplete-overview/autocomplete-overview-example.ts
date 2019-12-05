import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';


/**
 * @title Basic Input
 */
@Component({
    selector: 'autocomplete-overview-example',
    templateUrl: 'autocomplete-overview-example.html',
    styleUrls: ['autocomplete-overview-example.css']
})
export class AutocompleteOverviewExample {
    options = [
        'Abkhazia', 'Australia', 'Austria', 'Azerbaijan', 'Aland Islands', 'Albania', 'Algeria', 'Anguilla', 'Angola',
        'Andorra', 'Argentina', 'Armenia', 'Aruba', 'Afghanistan', 'Bahamas', 'Bangladesh', 'Barbados', 'Bahrain',
        'Belarus', 'Belize', 'Belgium', 'Benin', 'Bulgaria', 'Bolivia', 'Bosnia & Herzegovina', 'Botswana', 'Brazil',
        'Brunei Darussalam', 'Burundi', 'Bhutan', 'Vatican City', 'United Kingdom', 'Hungary', 'Venezuela', 'Timor',
        'Viet Nam', 'Gabon', 'Haiti', 'Gambia', 'Ghana', 'Guadeloupe', 'Guatemala', 'Guinea', 'Guinea-Bissau',
        'Germany', 'Gibraltar', 'Hong Kong', 'Honduras', 'Grenada', 'Greenland', 'Greece', 'Georgia', 'Guam', 'Denmark',
        'Dominica', 'Dominican Republic', 'Egypt', 'Zambia', 'Western Sahara', 'Zimbabwe', 'Israel', 'India',
        'Indonesia', 'Jordan', 'Iraq', 'Iran', 'Ireland', 'Iceland', 'Spain', 'Italy', 'Yemen', 'Kazakhstan',
        'Cambodia', 'Cameroon', 'Canada', 'Qatar', 'Kenya', 'Cyprus', 'Kyrgyzstan', 'Kiribati', 'China', 'Colombia',
        'Korea, D.P.R.', 'Korea', 'Costa Rica', 'Cote d\'Ivoire', 'Cuba', 'Kuwait', 'Lao P.D.R.', 'Latvia', 'Lesotho',
        'Liberia', 'Lebanon', 'Libyan Arab Jamahiriya', 'Lithuania', 'Liechtenstein', 'Luxembourg', 'Mauritius',
        'Mauritania', 'Madagascar', 'Macedonia', 'Malawi', 'Malaysia', 'Mali', 'Maldives', 'Malta', 'Morocco', 'Mexico',
        'Mozambique', 'Moldova', 'Monaco', 'Mongolia', 'Namibia', 'Nepal', 'Niger', 'Nigeria', 'Netherlands',
        'Nicaragua', 'New Zealand', 'Norway', 'United Arab Emirates', 'Oman', 'Pakistan', 'Panama', 'Paraguay', 'Peru',
        'Poland', 'Portugal', 'Russia', 'Romania', 'San Marino', 'Saudi Arabia', 'Senegal', 'Serbia', 'Singapore',
        'Syrian Arab Republic', 'Slovakia', 'Slovenia', 'Somalia', 'Sudan', 'USA', 'Tajikistan', 'Thailand', 'Tanzania',
        'Togo', 'Tunisia', 'Turkmenistan', 'Turkey', 'Uganda', 'Uzbekistan', 'Ukraine', 'Uruguay', 'Micronesia', 'Fiji',
        'Philippines', 'Finland', 'France', 'Croatia', 'Chad', 'Montenegro', 'Czech Republic', 'Chile', 'Switzerland',
        'Sweden', 'Sri Lanka', 'Ecuador', 'Eritrea', 'Estonia', 'Ethiopia', 'South Africa', 'Jamaica', 'Japan'
    ];

    control = new FormControl('');
    filteredOptions: Observable<string[]>;

    ngOnInit(): void {
        this.filteredOptions = this.control.valueChanges
            .pipe(
                startWith(''),
                map((value) => this.filter(value))
            );
    }

    private filter(value: string): string[] {
        const filterValue = value.toLowerCase();

        return this.options.filter((option) => option.toLowerCase().includes(filterValue));
    }
}
