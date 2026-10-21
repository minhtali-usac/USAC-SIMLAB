/**
 * F4–F8 (developed from TS Minh's lss-lab) are temporarily hidden while permission to publish them
 * is pending. Set to true to bring them back: the catalogue, the group description, the About page
 * and every cross-reference in other modules follow this flag. While false, Rollup drops their
 * chunks from the build, so their code is not deployed either.
 */
export const SHOW_F4_F8 = false;

/** Text that points to F4–F8: returned as is while they are shown, otherwise nothing. */
export const refF = (text: string) => (SHOW_F4_F8 ? text : '');
