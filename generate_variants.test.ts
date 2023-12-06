import fs from 'fs';
import {
  generateCombinations,
  printHelp,
  main,
  Product,
} from './generate_variants';

jest.mock('fs');

describe('generateCombinations', () => {
  let mockProduct: Product = {
    id: 1,
    name: 'Test Product',
    options: [
      {
        name: 'Color',
        values: ['Red', 'Blue'],
      },
      {
        name: 'Finish',
        values: [
          { name: '360 wrap print', price: 50, description: 'Full wrap' },
          { name: 'One-sided printing', price: 45, description: 'One side' },
        ],
      },
    ],
    description: 'Test product description',
  };

  it('generates correct number of combinations', () => {
    const result = generateCombinations(mockProduct);

    expect(result).toHaveLength(4);
  });

  it('dynamically creates number of unique variants based on input data', () => {
    const extendedOptionsProduct = {
      ...mockProduct,
      options: [
        ...mockProduct.options,
        { name: 'Material', values: ['metal', 'plastic', 'wood'] },
      ],
    };

    const result = generateCombinations(extendedOptionsProduct);
    expect(result).toHaveLength(12);
  });

  it("uses a variant's custom description over the base-line product description", () => {
    const result = generateCombinations(mockProduct);

    expect(
      result.find((value) => value.description === 'Full wrap'),
    ).toBeDefined();
  });

  it("uses a variant's custom price", () => {
    const result = generateCombinations(mockProduct);

    expect(
      result.find((value) => value.description === 'Full wrap').price,
    ).toBe(50);
    expect(result.find((value) => value.description === 'One side').price).toBe(
      45,
    );
  });

  it('uses the highest price specified if multiple options come with a custom price each', () => {
    const extendedOptionsProduct = {
      ...mockProduct,
      options: [
        ...mockProduct.options,
        {
          name: 'Material',
          values: [
            { name: 'metal', price: 70 },
            { name: 'plastic', price: 65 },
          ],
        },
      ],
    };
    const result = generateCombinations(extendedOptionsProduct);

    expect(result.find((value) => value.price === 50)).toBeUndefined();
    expect(result.find((value) => value.price === 45)).toBeUndefined();
    expect(result.find((value) => value.price === 65)).toBeDefined();
    expect(result.find((value) => value.price === 70)).toBeDefined();
  });

  it("uses a variant's custom field where appropriate", () => {
    const mockProductBackup = { ...mockProduct };
    mockProduct = {
      id: 1,
      name: 'Test Product',
      options: [
        {
          name: 'Color',
          values: ['Red', 'Blue'],
        },
        {
          name: 'Finish',
          values: [
            {
              name: '360 wrap print',
              price: 50,
              description: 'Full wrap',
              embossed: true,
            },
            { name: 'One-sided printing', price: 45, description: 'One side' },
          ],
        },
      ],
      description: 'Test product description',
    };
    const result = generateCombinations(mockProduct);

    expect(
      result.find((value) => value.description === 'Full wrap').embossed,
    ).toBe(true);
    expect(
      result.find((value) => value.description === 'One side').embossed,
    ).toBeUndefined();

    mockProduct = { ...mockProductBackup };
  });
});

describe('printHelp', () => {
  const helpDescription = `Moo Coding Task: Product Variant Generating Script\n
  SYNOPSIS
    yarn ts-node generate_variants.ts [--in=/path/to/input/file] [--out=/path/to/output/results/to] [--name=nameOfOutputFile] [-h, --help Print manual]

  DESCRIPTION
    Take input data with properties for a product and information about the existing options it may be configured with,
    output all possible variations as well as any other unique/additional properties each variant might have to a specified
    directory with the specified output JSON file name

    If no arguments are given, the input file and output file directory and name are populated with default values.

    Input file default value: input-data.json
    Output directory default: .
    Output file name: variants.json

    The following options are available:

    --in        Specify the directory + name of the input data file, e.g. ./home/test/products.json . Defaults to ./data/input-data.json

    --name      Specify the name of the output JSON file. Note that you don't need to add the file extension yourself. Defaults to "generated-variants-with-base-data".

    --out       Specify the output directory for the JSON file. Defaults to the "results/" directory.

    -h, --help  Print this help menu
  `;

  it('prints help menu', () => {
    const consoleSpy = jest.spyOn(console, 'info').mockImplementation(() => {});

    printHelp();

    expect(consoleSpy).toHaveBeenCalledWith(helpDescription);

    consoleSpy.mockRestore();
  });
});

describe('main', () => {
  it('prints error message for incorrect configuration', () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    main();

    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(String));

    consoleErrorSpy.mockRestore();
  });

  it('handles failure gracefully', () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    jest.mock('fs', () => ({
      ...jest.requireActual('fs'),
      readFileSync: jest.fn(() => {
        throw new Error('Mock readFileSync error');
      }),
    }));

    main();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'Failed to run. Please check input parameters and input file exists and matches the DB schema',
      ),
    );

    consoleErrorSpy.mockRestore();
  });

  it('handles successful execution', () => {
    const consoleInfoSpy = jest
      .spyOn(console, 'info')
      .mockImplementation(() => {});
    const writeFileSpy = jest
      .spyOn(fs, 'writeFileSync')
      .mockImplementation(() => {});

    jest
      .spyOn(fs, 'readFileSync')
      .mockReturnValue(JSON.stringify({ products: [] }));

    main();

    expect(consoleInfoSpy).toHaveBeenCalledWith(
      expect.stringContaining('Script ran successfully'),
    );
    expect(writeFileSpy).toHaveBeenCalledWith(
      './results/generated-variants-with-base-data.json',
      '[]',
    );

    consoleInfoSpy.mockRestore();
    writeFileSpy.mockRestore();
  });
});
