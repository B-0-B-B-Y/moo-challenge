/**
 * Product variant generating script
 *
 * @description Take input data with properties for a product and information about the existing options it may be configured with,
 *              output all possible variations as well as any other unique/additional properties each variant might have to a specified
 *              directory with the specified output JSON file name
 *
 * @assumptions I have assumed that the input data structure will be as I have defined, and will not fluctuate greatly from the overall
 *              tree setup that I have provided.
 *
 *              Multiple products can be processed at once with this script, each with different options, some variants having extra fields
 *              than others is also accounted for.
 *
 *              I have assumed that some properties are present for all products and can be expected to always be defined, as can be seen from the types below.
 *              There has been a data constraint that I have imposed on the input data as well of string, number, boolean or array.
 *
 *
 * @author Bob N (bob.naydenov@hotmail.com)
 */

import { randomUUID } from 'crypto';
import fs from 'fs';
import minimist, { type ParsedArgs } from 'minimist';

export interface OptionValue {
  name: string;
  price?: number;
  description?: string;
  [key: string]: string | number | boolean | OptionValue[];
}

export interface Product {
  id: number;
  name: string;
  options: ProductOption[];
  description: string;
}

export interface ProductOption {
  name: string;
  values: Array<string | OptionValue>;
}

const argv: ParsedArgs = minimist(process.argv.slice(2));

const INPUT_FILE_PATH: string = argv?.in ?? './data/input-data.json';
const OUTPUT_DIR: string = argv?.out ?? './results';
const OUTPUT_FILE_NAME: string =
  argv?.name ?? 'generated-variants-with-base-data';

export const generateCombinations = (product: Product): OptionValue[] => {
  return product.options.reduce(
    (combinations, option) => {
      return combinations.flatMap((combination) =>
        option.values.map((value) => {
          const isObject = typeof value === 'object' && value !== null;
          const optionName = option.name.toLowerCase();

          const variant: OptionValue = {
            ...combination,
            id: randomUUID(),
            parentProductId: product.id,
            parentProductName: product.name,
            description: combination.description ?? product.description,
            price: combination.price,
          };

          if (!isObject) {
            variant[optionName] = value as string;
          } else {
            variant[optionName] = value.name;

            // Handle the specific edge case of multiple prices being specified by different options, highest value number is favoured
            if (variant.price === undefined || value['price'] > variant.price) {
              variant.price = value['price'] as number;
            }

            Object.keys(value).forEach((key) => {
              const sanitisedKey = key.toLowerCase();

              if (sanitisedKey === 'name' || sanitisedKey === 'price') {
                return;
              }

              variant[sanitisedKey] = value[sanitisedKey];
            });
          }

          return variant;
        }),
      );
    },
    [{} as OptionValue],
  );
};

export const printHelp = (): void => {
  console.info(`Moo Coding Task: Product Variant Generating Script\n
  SYNOPSIS
    yarn ts-node generate_variants.ts [--in=/path/to/input/file] [--out=/path/to/output/results/to] [--name=nameOfOutputFile] [-h, --help Print manual]

  DESCRIPTION
    Take input data with properties for a product and information about the existing options it may be configured with,
    output all possible variations as well as any other unique/additional properties each variant might have to a specified
    directory with the specified output JSON file name

    If no arguments are given, the input file and output file directory and name are populated with default values.

    Input file default value: data/input-data.json
    Output directory default: results/
    Output file name: generated-variants-with-base-data.json

    The following options are available:

    --in        Specify the directory + name of the input data file, e.g. ./home/test/products.json . Defaults to ./data/input-data.json

    --name      Specify the name of the output JSON file. Note that you don't need to add the file extension yourself. Defaults to "generated-variants-with-base-data".

    --out       Specify the output directory for the JSON file. Defaults to the "results/" directory.

    -h, --help  Print this help menu
  `);
};

export const main = (): void => {
  if (argv?.help || argv?.h) {
    printHelp();
    process.exit();
  }

  // Should never hit this as defaults are being set, but better to enforce strict checking
  if (!INPUT_FILE_PATH || !OUTPUT_DIR) {
    console.error(
      'Incorrect configuration of required arguments, please try again. For more information on arguments, please run the script with --help',
    );
  }

  try {
    const inputJSON: { products: Product[] } = JSON.parse(
      fs.readFileSync(INPUT_FILE_PATH, 'utf-8'),
    );
    const productVariants = inputJSON.products.flatMap((product) =>
      generateCombinations(product),
    );
    const outputFile = `${OUTPUT_DIR}/${OUTPUT_FILE_NAME}.json`;

    fs.writeFileSync(outputFile, JSON.stringify(productVariants, null, 2));
    console.info(
      `Script ran successfully, ${productVariants?.length} variants generated at ${outputFile}`,
    );
  } catch (err) {
    console.error(
      `Failed to run. Please check input parameters and input file exists and matches the DB schema.\n\n Error returned: ${err}`,
    );
  }
};

main();
