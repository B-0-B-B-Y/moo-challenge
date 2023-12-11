# moo-challenge

A coding task for MOO as part of the application process

## Setup

1. Run `nvm use` or `nvm install` in case you don't have the required node version
2. Run `yarn` to install all dependencies
3. Run `yarn ts-node generate_variants.ts --help` to see detailed instructions on how to use the script

## Script manpage

```
Moo Coding Task: Product Variant Generating Script\n

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

    --in        Specify the directory + name of the input data file, e.g. ./home/test/products.json . Defaults to "data/input-data.json"

    --name      Specify the name of the output JSON file. Note that you don't need to add the file extension yourself. Defaults to "generated-variants-with-base-data".

    --out       Specify the output directory for the JSON file. Defaults to the "results/" directory.

    -h, --help  Print this help menu
```

## Example

`yarn ts-node generate_variants.ts` => This will assume the input data is located at `./input-data.json` and the output will be to `./variants.json`

## Explanation of results

For the coding task itself, if the script is ran without any parameters, the example data that can be inferred from the coding task description will be used, which is what is contained in the file `data/input-data.json`. The output will be in `results/generated-variants-with-base-data.json`.

I've created an expanded data set with more than 1 products, for which the input data can be found inside `data/expanded-data.json`.
To run that specific data set, the following complete command can be used: `yarn ts-node generate_variants.ts --in data/expanded-data.json --name generated-variants-with-expanded-data --out ./results`. The results can be seen in the subsequently created `results/generated-variants-with-expanded-data.json` file.

## Running unit tests

If you have already installed the node modules, then simply run: `yarn jest`, otherwise run `yarn && yarn jest`
