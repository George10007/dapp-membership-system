async function main() {
    const HonestClub1 = await ethers.getContractFactory("HonestClub1");
    const honestClub = await HonestClub1.deploy();
    await honestClub.deployed();
  
    console.log("HonestClub1 deployed to:", honestClub.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  